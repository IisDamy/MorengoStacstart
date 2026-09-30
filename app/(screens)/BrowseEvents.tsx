import { addBooking, getEvents, RunPaystackAction, findActiveBookingForSlot, deleteBooking } from "@/lib/appwrite";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthStore from "@/store/auth.store";
import { BookingPayload, EventPayload } from "@/types";
import * as WebBrowser from "expo-web-browser";
import { EVENT_TYPES } from "@/constants";

// ─── Types ────────────────────────────────────────────────────────────────

type ServiceOffer = { name: string; price: number };
type SelectedOfferProps = { name: string; price: number };

// ─── Constants ────────────────────────────────────────────────────────────

const TYPE_FILTERS = [...EVENT_TYPES];

const BRAND = "#f97316";
const FALLBACK_COLOR = "#f97316";

const TYPE_COLORS: Record<string, string> = {
  cosmetics: "#db2777",
  handywork: "#0284c7",
  "private lessons": "#7c3aed",
  barbing: "#ea580c",
  laundry: "#0891b2",
  photography: "#4f46e5",
  gaming: "#16a34a",
  printing: "#475569",
  hosting: "#e11d48",
  music: "#c026d3",
  other: "#059669",
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cosmetics: "color-palette-outline",
  handywork: "hammer-outline",
  "private lessons": "school-outline",
  barbing: "cut-outline",
  laundry: "shirt-outline",
  photography: "camera-outline",
  gaming: "game-controller-outline",
  printing: "print-outline",
  hosting: "mic-outline",
  music: "musical-note-outline",
  other: "sparkles-outline",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const parseJsonArray = <T,>(raw: string): T[] => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const naira = (n: number) => `₦${n.toLocaleString()}`;

const getMinPrice = (offers: ServiceOffer[]) =>
  offers.length === 0 ? null : Math.min(...offers.map((o) => o.price));

const hasPriceRange = (offers: ServiceOffer[]) =>
  offers.length > 1 && new Set(offers.map((o) => o.price)).size > 1;

const formatDateLabel = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const splitDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return { weekday: "", day: dateString, month: "" };
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    day: d.toLocaleDateString(undefined, { day: "numeric" }),
    month: d.toLocaleDateString(undefined, { month: "short" }),
  };
};

const formatTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${meridiem}`;
};

/** Parses a "9:00 AM"-style string into a Date anchored to `base` (defaults to today). */
const parseTimeStringToDate = (timeStr: string, base: Date = new Date()) => {
  const d = new Date(base);
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return d;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Next few upcoming calendar dates that fall on one of the given weekdays. */
const getUpcomingDates = (dotw: string[], count = 6) => {
  const dates: { dateString: string; label: string }[] = [];
  const today = new Date();
  let i = 0;
  while (dates.length < count && i < 30) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (dotw.includes(DAY_ABBR[d.getDay()])) {
      dates.push({
        dateString: d.toISOString().split("T")[0],
        label: formatDateLabel(d.toISOString()),
      });
    }
    i++;
  }
  return dates;
};

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ─── Small UI pieces ──────────────────────────────────────────────────────

const MetaItem = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View className="flex-row items-center bg-zinc-100 rounded-full px-2.5 py-1.5 mr-2 mb-2">
    <Ionicons name={icon} size={12} color="#52525b" />
    <Text className="text-[11.5px] font-[Nunito-semibold] text-zinc-600 ml-1.5">{text}</Text>
  </View>
);

const SectionTitle = ({ title, hint }: { title: string; hint?: string }) => (
  <View className="mb-2.5">
    <Text className="text-[14px] font-[Nunito-bold] text-zinc-900">{title}</Text>
    {hint ? <Text className="text-[12px] font-[Nunito-regular] text-zinc-500 mt-0.5">{hint}</Text> : null}
  </View>
);

// ─── Event Card ───────────────────────────────────────────────────────────

const EventCard = ({ event, onBook }: { event: EventPayload; onBook: () => void }) => {
  const offers = parseJsonArray<ServiceOffer>(event.offers);
  const minPrice = getMinPrice(offers);
  const dotw = event.weekly ? parseJsonArray<string>(event.dotw) : [];
  const typeColor = TYPE_COLORS[event.type] ?? FALLBACK_COLOR;
  const typeIcon = TYPE_ICONS[event.type] ?? "sparkles-outline";

  const availability = event.weekly
    ? dotw.length > 0
      ? dotw.join(", ")
      : "Weekly"
    : `${event.dateTimeOnce.length} date${event.dateTimeOnce.length === 1 ? "" : "s"}`;

  return (
    <View className="bg-white rounded-[22px] border border-zinc-200/80 overflow-hidden">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-[14px] items-center justify-center mr-3"
            style={{ backgroundColor: `${typeColor}14` }}
          >
            <Ionicons name={typeIcon} size={22} color={typeColor} />
          </View>
          <View className="flex-1">
            <Text className="text-[16px] font-[Nunito-bold] text-zinc-900" numberOfLines={1}>
              {event.name}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-[12px] font-[Nunito-semibold]" style={{ color: typeColor }}>
                {capitalize(event.type)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text
          className="text-[13px] text-zinc-600 font-[Nunito-regular] leading-[20px] mt-3"
          numberOfLines={2}
        >
          {event.description}
        </Text>

        {/* Location */}
        <View className="flex-row items-center mt-3">
          <Ionicons name="location-sharp" size={14} color="#a1a1aa" />
          <Text
            className="text-[12.5px] font-[Nunito-medium] text-zinc-500 ml-1 flex-1"
            numberOfLines={1}
          >
            {event.locationText}
          </Text>
        </View>

        {/* Meta chips */}
        <View className="flex-row flex-wrap mt-3 -mb-2">
          <MetaItem icon="calendar-outline" text={availability} />
          <MetaItem icon="time-outline" text={`${event.openTime} – ${event.closeTime}`} />
          <MetaItem icon="hourglass-outline" text={`${event.duration} min`} />
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/70">
        <View>
          {minPrice !== null ? (
            <>
              <Text className="text-[11px] font-[Nunito-medium] text-zinc-500">
                {hasPriceRange(offers) ? "Starting from" : "Price"}
              </Text>
              <Text className="text-[17px] font-[Nunito-bold] text-zinc-900">{naira(minPrice)}</Text>
            </>
          ) : (
            <Text className="text-[13px] font-[Nunito-medium] text-zinc-500">Contact for price</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onBook}
          activeOpacity={0.85}
          className="bg-zinc-900 rounded-full h-[42px] px-5 flex-row items-center justify-center"
        >
          <Text className="text-white font-[Nunito-bold] text-[13px] mr-1.5">Book</Text>
          <Ionicons name="arrow-forward" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Booking Modal ────────────────────────────────────────────────────────

const BookingModal = ({
  event,
  visible,
  onClose,
  onConfirm,
}: {
  event: EventPayload | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateString: string, time: string, offer: SelectedOfferProps) => Promise<void>;
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<SelectedOfferProps | null>(null);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setShowTimePicker(false);
    setSelectedOffer(null);
  }, [event]);

  if (!event) return null;

  const offers = parseJsonArray<ServiceOffer>(event.offers);
  const dateOptions = event.weekly
    ? getUpcomingDates(parseJsonArray<string>(event.dotw))
    : event.dateTimeOnce.map((d) => ({ dateString: d, label: formatDateLabel(d) }));

  const openDate = parseTimeStringToDate(event.openTime);
  const closeDate = parseTimeStringToDate(event.closeTime);
  const latestStartDate = new Date(closeDate.getTime() - event.duration * 60000);

  const handleConfirm = async () => {
    if (!selectedOffer) {
      Alert.alert("Pick a service", "Choose one of the offers to continue.");
      return;
    }
    if (!selectedDate) {
      Alert.alert("Pick a date", "Choose when you'd like to book this.");
      return;
    }
    if (!selectedTime) {
      Alert.alert("Pick a time", "Choose a time within the available hours.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(selectedDate, formatTime(selectedTime), selectedOffer);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeColor = TYPE_COLORS[event.type] ?? FALLBACK_COLOR;
  const typeIcon = TYPE_ICONS[event.type] ?? "sparkles-outline";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end pb-6 bg-black/50">
        {/* Tap outside to dismiss */}
        <Pressable className="flex-1" onPress={onClose} />

        <View className="bg-white rounded-t-[28px] pt-3 max-h-[88%]">
          <View className="w-10 h-1 bg-zinc-300 rounded-full self-center mb-4" />

          {/* Header */}
          <View className="flex-row items-center px-5 pb-4 border-b border-zinc-100">
            <View
              className="w-11 h-11 rounded-[13px] items-center justify-center mr-3"
              style={{ backgroundColor: `${typeColor}14` }}
            >
              <Ionicons name={typeIcon} size={20} color={typeColor} />
            </View>
            <View className="flex-1 pr-3">
              <Text className="text-[18px] font-[Crispy] text-zinc-900" numberOfLines={1}>
                {event.name}
              </Text>
              <Text className="text-[12px] font-[Nunito-medium] text-zinc-500 mt-0.5" numberOfLines={1}>
                {event.locationText}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
              className="w-9 h-9 rounded-full bg-zinc-100 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#52525b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}
          >
            {/* Offers */}
            {offers.length > 0 && (
              <View className="mb-6">
                <SectionTitle title="Choose a service" />
                {offers.map((offer) => {
                  const active = selectedOffer?.name === offer.name;
                  return (
                    <Pressable
                      key={offer.name}
                      onPress={() => setSelectedOffer({ name: offer.name, price: offer.price })}
                      className={`flex-row items-center px-4 py-3.5 rounded-2xl mb-2.5 border ${
                        active ? "bg-orange-50 border-orange-500" : "bg-white border-zinc-200"
                      }`}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                          active ? "border-orange-500" : "border-zinc-300"
                        }`}
                      >
                        {active && <View className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                      </View>
                      <Text
                        className="flex-1 text-[14px] font-[Nunito-semibold] text-zinc-800 pr-2"
                        numberOfLines={2}
                      >
                        {offer.name}
                      </Text>
                      <Text className="text-[14px] font-[Nunito-bold] text-zinc-900">
                        {naira(offer.price)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Dates */}
            <View className="mb-6">
              <SectionTitle title="Select a date" />
              {dateOptions.length === 0 ? (
                <View className="bg-zinc-50 rounded-2xl px-4 py-4 border border-zinc-100">
                  <Text className="text-[13px] font-[Nunito-medium] text-zinc-500">
                    No upcoming dates. Check back soon.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 8 }}
                >
                  {dateOptions.map((d) => {
                    const active = selectedDate === d.dateString;
                    const parts = splitDate(d.dateString);
                    return (
                      <TouchableOpacity
                        key={d.dateString}
                        onPress={() => setSelectedDate(d.dateString)}
                        activeOpacity={0.8}
                        className={`w-[64px] py-3 rounded-2xl mr-2.5 items-center border ${
                          active ? "bg-zinc-900 border-zinc-900" : "bg-white border-zinc-200"
                        }`}
                      >
                        <Text
                          className={`text-[12px] font-[Nunito-semibold] ${
                            active ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {parts.weekday}
                        </Text>
                        <Text
                          className={`text-[20px] font-[Nunito-bold] my-0.5 ${
                            active ? "text-white" : "text-zinc-900"
                          }`}
                        >
                          {parts.day}
                        </Text>
                        <Text
                          className={`text-[12px] font-[Nunito-medium] ${
                            active ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {parts.month}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Time */}
            <View className="mb-2">
              <SectionTitle title="Select a time" hint={`Open ${event.openTime} – ${event.closeTime}`} />
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between rounded-2xl h-[52px] px-4 border ${
                  selectedTime ? "bg-orange-50 border-orange-500" : "bg-white border-zinc-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={18} color={selectedTime ? BRAND : "#71717a"} />
                  <Text
                    className={`ml-2.5 text-[14px] font-[Nunito-semibold] ${
                      selectedTime ? "text-zinc-900" : "text-zinc-500"
                    }`}
                  >
                    {selectedTime ? formatTime(selectedTime) : "Choose a start time"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#a1a1aa" />
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime ?? openDate}
                  mode="time"
                  minimumDate={openDate}
                  maximumDate={latestStartDate}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_event, date) => {
                    if (Platform.OS === "android") setShowTimePicker(false);
                    if (!date) return;
                    if (date < openDate) date = openDate;
                    if (date > latestStartDate) date = latestStartDate;
                    setSelectedTime(date);
                  }}
                />
              )}
            </View>
          </ScrollView>

          {/* Sticky footer */}
          <View className="px-5 pt-3 pb-8 border-t border-zinc-100 bg-white">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[13px] font-[Nunito-medium] text-zinc-500">Total</Text>
              <Text className="text-[18px] font-[Nunito-bold] text-zinc-900">
                {selectedOffer ? naira(selectedOffer.price) : "—"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isSubmitting}
              activeOpacity={0.85}
              className="bg-zinc-900 rounded-2xl h-[54px] items-center justify-center"
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-[Nunito-bold] text-[15px]">
                  {selectedOffer ? `Pay ${naira(selectedOffer.price)} & book` : "Confirm booking"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────

const BrowseEvents = () => {
  const [events, setEvents] = useState<EventPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [bookingEvent, setBookingEvent] = useState<EventPayload | null>(null);
  const { user } = useAuthStore();

  const fetchEvents = async () => {
    try {
      const res: any = await getEvents();
      if (res) setEvents(res);
    } catch (e) {
      Alert.alert("Error", "Could not load services right now.");
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchEvents();
      setIsLoading(false);
    })();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
  };

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesType = activeType === "all" || event.type === activeType;
      const matchesSearch =
        !query ||
        event.name.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [events, activeType, search]);

  const handleConfirmBooking = async (
    dateString: string,
    time: string,
    offer: SelectedOfferProps
  ) => {
    if (!bookingEvent || !user?.$id) return;

    const scheduledAt = parseTimeStringToDate(time, new Date(dateString));
    const scheduledAtIso = scheduledAt.toISOString();

    try {
      const existing = await findActiveBookingForSlot(user.$id, bookingEvent.$id, scheduledAtIso);
      if (existing) {
        if (existing.status === "pending_payment") {
          Alert.alert(
            "Already booked",
            "You've already started booking this slot but haven't paid yet. Check your Bookings tab to finish payment."
          );
        } else {
          Alert.alert("Already booked", "You've already booked this slot.");
        }
        return;
      }
    } catch (e) {
      console.error(e);
    }

    let booking;
    try {
      const payload: BookingPayload = {
        customerId: user.$id,
        providerId: bookingEvent.userId,
        eventId: bookingEvent.$id,
        dateTime: dateString,
        time,
        scheduledAt: scheduledAtIso,
        eventName: bookingEvent.name,
        eventType: bookingEvent.type,
        eventLocation: bookingEvent.locationText,
        eventCoords: bookingEvent.coords,
        status: "pending_payment",
        offerName: offer.name,
        total: offer.price,
      };
      booking = await addBooking(payload);
      console.log(scheduledAtIso)
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not create the booking.");
      return;
    }

    let paymentRes;
    try {
      paymentRes = await RunPaystackAction("payment.initialize", {
        customerId: user.$id,
        customerEmail: user.email,
        fieldId: booking.$id,
        field: "booking",
        total: offer.price,
        metadata: {
          eventId: bookingEvent.$id,
          eventName: bookingEvent.name,
          dateTime: dateString,
          time,
          offerName: offer.name,
        },
      });

      console.log(paymentRes)
    } catch (e: any) {
      // await deleteBooking(booking.$id);
      Alert.alert("Error", "Could not start payment. Try again.");
      return;
    }

    if (!paymentRes?.authorizationUrl) {
      // await deleteBooking(booking.$id);
      Alert.alert("Error", paymentRes?.message || "Payment could not be started.");
      return;
    }

    setBookingEvent(null);

    const result = await WebBrowser.openAuthSessionAsync(paymentRes.data.authorizationUrl);

    if (result.type !== "success" && result.type !== "dismiss") return;

    try {
      const verifyRes = await RunPaystackAction("payment.verify", {
        reference: paymentRes.data.paymentReference,
      });

      if (verifyRes?.data?.paid) {
        Alert.alert("Booked! 🎉", "Your payment was confirmed and the booking is set.");
      } else {
        Alert.alert("Almost there", "We're still confirming your payment. Check your bookings shortly.");
      }
    } catch (e) {
      Alert.alert("Almost there", "We're still confirming your payment. Check your bookings shortly.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      {/* ── Header ── */}
      <View className="px-5 pt-3 pb-4">
        <Text className="text-[20px] mb-2 leading-[32px] font-[Crispy] text-zinc-900">
          Find your next service
        </Text>
        <Text className="text-[14px] font-[Nunito-medium] text-zinc-500 mt-1">
          Book skilled people near you, on their schedule.
        </Text>
      </View>

      {/* ── Search ── */}
      <View className="px-5 mb-3">
        <View className="flex-row items-center bg-white rounded-2xl border border-zinc-200 h-[50px] px-4">
          <Ionicons name="search" size={18} color="#a1a1aa" />
          <TextInput
            className="flex-1 ml-2.5 text-[14px] text-zinc-900 font-[Nunito-regular]"
            placeholder="Search services"
            placeholderTextColor="#a1a1aa"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="#d4d4d8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Type filters ── */}
      <View style={{ height: 52 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: "center" }}
        >
          {TYPE_FILTERS.map((f) => {
            const active = activeType === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setActiveType(f.value)}
                activeOpacity={0.8}
                className={`px-4 h-[38px] items-center justify-center rounded-full border ${
                  active ? "bg-zinc-900 border-zinc-900" : "bg-white border-zinc-200"
                }`}
              >
                <Text
                  className={`text-[13px] font-[Nunito-semibold] ${
                    active ? "text-white" : "text-zinc-600"
                  }`}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Result count ── */}
      {!isLoading && (
        <Text className="px-5 pb-2 text-[12.5px] font-[Nunito-medium] text-zinc-500">
          {filteredEvents.length} {filteredEvents.length === 1 ? "service" : "services"}
        </Text>
      )}

      {/* ── List ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={BRAND} />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32, gap: 14 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={BRAND} />
          }
          ListEmptyComponent={
            <View className="items-center mt-16 px-8">
              <View className="w-14 h-14 rounded-full bg-zinc-100 items-center justify-center mb-3">
                <Ionicons name="search-outline" size={24} color="#a1a1aa" />
              </View>
              <Text className="text-[15px] font-[Nunito-bold] text-zinc-800">No services found</Text>
              <Text className="text-[13px] font-[Nunito-regular] text-zinc-500 text-center mt-1">
                Try a different search or pick another category.
              </Text>
            </View>
          }
          renderItem={({ item }) => <EventCard event={item} onBook={() => setBookingEvent(item)} />}
        />
      )}

      <BookingModal
        event={bookingEvent}
        visible={!!bookingEvent}
        onClose={() => setBookingEvent(null)}
        onConfirm={handleConfirmBooking}
      />
    </SafeAreaView>
  );
};

export default BrowseEvents;