import CustomInput from "@/components/ui/CustomInput";
import { createEvent, getEvents } from "@/lib/appwrite";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { EVENT_TYPES } from "@/constants";
// ─── Constants ────────────────────────────────────────────────────────────

//  laundry:"shirt-outline",
//   photography:"camera-outline",
//   gaming:"game-controller-outline",
//   music:"mic-circle-outline",
//   other: "sparkles-outline",



const DOTW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type OfferDraft = { id: string; name: string; price: string };

// ─── Small pieces ─────────────────────────────────────────────────────────

const SectionLabel = ({ label, sub }: { label: string; sub?: string }) => (
  <View className="mb-3">
    <Text className="text-[14px] font-[Nunito-bold] text-zinc-100 tracking-wide">
      {label}
    </Text>
    {sub && (
      <Text className="text-[12px] text-zinc-400 mt-2 font-[Nunito-regular]">
        {sub}
      </Text>
    )}
  </View>
);

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`px-4 py-2.5 rounded-2xl mr-2 mb-2 border ${
      active ? "bg-orange-500 border-orange-500" : "bg-zinc-800 border-zinc-700"
    }`}
  >
    <Text
      className={`text-[13px] font-[Nunito-semibold] ${
        active ? "text-white" : "text-zinc-400"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Helpers ──────────────────────────────────────────────────────────────

const formatTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${meridiem}`;
};

const toMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

// ─── Main Component ───────────────────────────────────────────────────────

const CreateService = () => {
  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [offers, setOffers] = useState<OfferDraft[]>([]);
  const [duration, setDuration] = useState("");
  const [locationText, setLocationText] = useState("");
  const [locationSharing, setLocationSharing] = useState(false);

  const [weekly, setWeekly] = useState(true);
  const [dotw, setDotw] = useState<string[]>([]);
  const [dateTimeOnce, setDateTimeOnce] = useState<string[]>([]);

  // Opening hours — a single daily window customers can book within,
  // rather than a fixed list of exact time slots.
  const [openTime, setOpenTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [closeTime, setCloseTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    return d;
  });
  const [activeTimeField, setActiveTimeField] = useState<"open" | "close" | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);


  const {getCurrentLocation, coords, error} = useCurrentLocation()

  // ── Handlers ────────────────────────────────────────────────────────────

  const toggleDay = (day: string) => {
    setDotw((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleDate = (dateString: string) => {
    setDateTimeOnce((prev) =>
      prev.includes(dateString)
        ? prev.filter((d) => d !== dateString)
        : [...prev, dateString],
    );
  };

  const addOffer = () => {
    setOffers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", price: "" },
    ]);
  };

  const updateOffer = (id: string, field: "name" | "price", value: string) => {
    setOffers((prev) =>
      prev.map((offer) => (offer.id === id ? { ...offer, [field]: value } : offer)),
    );
  };

  const removeOffer = (id: string) => {
    setOffers((prev) => prev.filter((offer) => offer.id !== id));
  };

  const handleSubmit = async () => {
    if (!name.trim())
      return Alert.alert("Missing info", "Give your gig a name.");
    if (!type)
      return Alert.alert("Missing info", "Select what kind of gig this is.");
    if (!description.trim())
      return Alert.alert("Missing info", "Add a short description.");
    if (offers.length === 0)
      return Alert.alert("Missing info", "Add at least one offer with a price.");
    const invalidOffer = offers.find(
      (o) => !o.name.trim() || !o.price || isNaN(Number(o.price)) || Number(o.price) <= 0,
    );
    if (invalidOffer)
      return Alert.alert("Missing info", "Every offer needs a name and a valid price.");
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0)
      return Alert.alert(
        "Missing info",
        "Enter how long each session takes, in minutes.",
      );

    const durationNum = Number(duration);
    if (toMinutes(closeTime) <= toMinutes(openTime))
      return Alert.alert("Invalid hours", "Closing time must be after opening time.");
    if (toMinutes(closeTime) - toMinutes(openTime) < durationNum)
      return Alert.alert(
        "Invalid hours",
        `You need to be open for at least ${durationNum} minutes.`,
      );

    if (!locationText.trim())
      return Alert.alert("Missing info", "Let customers know where you're based.");
    if (weekly && dotw.length === 0)
      return Alert.alert("Missing info", "Pick at least one day you're open.");
    if (!weekly && dateTimeOnce.length === 0)
      return Alert.alert("Missing info", "Pick at least one date on the calendar.");

    setIsSubmitting(true);
    try {
      const oldEvents = await getEvents();
      const nameExists = oldEvents.find((event) => event.name === name);
      if (nameExists) throw Error("This name is already in use");

      await createEvent({
        name,
        type,
        description,
        offers: JSON.stringify(
          offers.map((o) => ({ name: o.name.trim(), price: Number(o.price) })),
        ),
        weekly,
        coords,
        dotw: JSON.stringify(weekly ? dotw : []),
        duration: durationNum,
        openTime: formatTime(openTime),
        closeTime: formatTime(closeTime),
        locationText,
        userId: "replace-with-auth-user-id",
        dateTimeOnce: weekly ? [] : dateTimeOnce,
      });

      Alert.alert("Gig created! 🎉", "Your gig is now live.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };



  useEffect(()=>{
    if (locationSharing){
       async () => {
        try {
           await getCurrentLocation()     
        }
        catch (e){
          setLocationSharing(false)
          Alert.alert("Error", e?.message || "Location sharing failed")
        }
       }

    } 

  },[locationSharing])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-zinc-900">
      {/* ── Hero ── */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop",
        }}
        resizeMode="cover"
        className="h-[190px] rounded-b-[32px] overflow-hidden"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.8)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View className="flex-1 justify-between p-5">
          <View className="flex-row items-start justify-between">
            <View className="w-11 h-11 rounded-2xl bg-white/25 items-center justify-center">
              <Ionicons name="sparkles-outline" size={20} color="white" />
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1.5">
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest">
                Gig
              </Text>
            </View>
          </View>
          <View>
            <Text className="text-[24px] font-[Crispy] text-white">
              Start your gig
            </Text>
            <Text className="text-[13px] font-[Nunito-medium] text-white/85 mt-1">
              Turn what you're good at into bookings
            </Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Gig Name ── */}
        <View className="mb-5">
          <SectionLabel label="Gig Name" />
          <CustomInput
            placeholder="e.g. Tobi's Fades"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />
        </View>

        {/* ── Type ── */}
        <View className="mb-5">
          <SectionLabel label="What do you offer?" />
          <View className="flex-row flex-wrap">
            {EVENT_TYPES.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={type === opt.value}
                onPress={() => setType(opt.value)}
              />
            ))}
          </View>
        </View>

        {/* ── Description ── */}
        <View className="mb-5">
          <SectionLabel label="Short Description" sub="What should customers know?" />
          <CustomInput
            placeholder="e.g. Clean fades and line-ups, in and out in 30 minutes"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={100}
          />
          <Text className="text-[11px] text-zinc-400 mt-1.5 text-right font-[Nunito-regular]">
            {description.length}/100
          </Text>
        </View>

        {/* ── Offers ── */}
        <View className="mb-5">
          <SectionLabel
            label="Your Offers"
            sub="Add each thing you offer and its price — e.g. Skin fade, Line up"
          />

          {offers.length === 0 && (
            <View className="bg-zinc-800 border border-dashed border-zinc-700 rounded-2xl py-6 items-center mb-3">
              <View className="w-10 h-10 rounded-2xl bg-orange-500/15 items-center justify-center mb-2">
                <Ionicons name="pricetag-outline" size={18} color="#f97316" />
              </View>
              <Text className="text-[13px] text-zinc-400 font-medium">
                No offers yet
              </Text>
              <Text className="text-[11px] text-zinc-500 mt-0.5">
                Tap below to add your first offer
              </Text>
            </View>
          )}

          {offers.map((offer, index) => (
            <View
              key={offer.id}
              className="flex-row items-center bg-zinc-800 border border-zinc-700 rounded-2xl h-[52px] pl-4 pr-2 mb-2.5"
            >
              <Text className="text-[11px] font-[Nunito-bold] text-zinc-400 w-5">
                {index + 1}.
              </Text>
              <TextInput
                className="flex-1 text-zinc-100 text-[14px] font-[Nunito-regular]"
                placeholder="e.g. Skin fade"
                placeholderTextColor="#71717a"
                value={offer.name}
                onChangeText={(v) => updateOffer(offer.id, "name", v)}
              />
              <View className="w-px h-6 bg-zinc-700 mx-2" />
              <TextInput
                className="w-[70px] text-zinc-100 text-[14px] font-[Nunito-regular] text-right"
                placeholder="Price"
                placeholderTextColor="#71717a"
                keyboardType="numeric"
                value={offer.price}
                onChangeText={(v) => updateOffer(offer.id, "price", v)}
              />
              <TouchableOpacity
                onPress={() => removeOffer(offer.id)}
                className="ml-2 pl-1"
              >
                <Ionicons name="close-circle" size={18} color="#71717a" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={addOffer}
            className="border-2 border-dashed border-orange-500/40 rounded-2xl h-[52px] flex-row items-center justify-center gap-2 bg-orange-500/10"
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={18} color="#f97316" />
            <Text className="text-[14px] font-semibold text-orange-400">
              Add offer
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Duration ── */}
        <View className="mb-5">
          <SectionLabel
            label="Duration (mins)"
            sub="How long does each session take?"
          />
          <CustomInput
            placeholder="e.g. 30"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        {/* ── Weekly toggle ── */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <SectionLabel
              label="Availability"
              sub={
                weekly
                  ? "Repeats every week on the days you pick"
                  : "One-off dates you pick on a calendar"
              }
            />
          </View>
          <View className="flex-row items-center justify-between bg-zinc-800 border border-zinc-700 rounded-2xl px-4 h-[52px]">
            <Text className="text-[13px] font-[Nunito-semibold] text-zinc-300">
              Repeats weekly
            </Text>
            <Switch
              value={weekly}
              onValueChange={setWeekly}
              trackColor={{ false: "#52525b", true: "#fdba74" }}
              thumbColor={weekly ? "#f97316" : "#d4d4d8"}
            />
          </View>
        </View>

        {/* ── Days of the week (weekly) ── */}
        {weekly ? (
          <View className="mb-5">
            <SectionLabel label="Days you're open" />
            <View className="flex-row flex-wrap">
              {DOTW.map((day) => (
                <Chip
                  key={day}
                  label={day}
                  active={dotw.includes(day)}
                  onPress={() => toggleDay(day)}
                />
              ))}
            </View>
          </View>
        ) : (
          <View className="mb-5">
            <SectionLabel
              label="Pick your dates"
              sub={`${dateTimeOnce.length} date${dateTimeOnce.length === 1 ? "" : "s"} selected`}
            />
            <View className="border border-zinc-700 rounded-2xl overflow-hidden">
              <Calendar
                minDate={new Date().toISOString().split("T")[0]}
                onDayPress={(day) => toggleDate(day.dateString)}
                markedDates={dateTimeOnce.reduce(
                  (acc, date) => ({
                    ...acc,
                    [date]: { selected: true, selectedColor: "#f97316" },
                  }),
                  {} as Record<string, any>,
                )}
                theme={{
                  calendarBackground: "#27272a",
                  dayTextColor: "#e4e4e7",
                  monthTextColor: "#f4f4f5",
                  textSectionTitleColor: "#a1a1aa",
                  textDisabledColor: "#52525b",
                  todayTextColor: "#f97316",
                  arrowColor: "#f97316",
                  selectedDayBackgroundColor: "#f97316",
                  selectedDayTextColor: "#ffffff",
                }}
              />
            </View>
          </View>
        )}

        {/* ── Opening hours ── */}
        <View className="mb-5">
          <SectionLabel
            label="Opening Hours"
            sub="Set the daily window customers can book a session within"
          />

          <TouchableOpacity
            className="flex-row items-center justify-between bg-zinc-800 border border-zinc-700 rounded-2xl h-[52px] px-4 mb-2.5"
            onPress={() => setActiveTimeField("open")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="sunny-outline" size={16} color="#f97316" />
              <Text className="ml-2 text-zinc-300 text-[13px] font-[Nunito-semibold]">
                Opens at
              </Text>
            </View>
            <Text className="text-zinc-100 text-[14px] font-[Nunito-bold]">
              {formatTime(openTime)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between bg-zinc-800 border border-zinc-700 rounded-2xl h-[52px] px-4"
            onPress={() => setActiveTimeField("close")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="moon-outline" size={16} color="#f97316" />
              <Text className="ml-2 text-zinc-300 text-[13px] font-[Nunito-semibold]">
                Closes at
              </Text>
            </View>
            <Text className="text-zinc-100 text-[14px] font-[Nunito-bold]">
              {formatTime(closeTime)}
            </Text>
          </TouchableOpacity>

          {activeTimeField && (
            <DateTimePicker
              value={activeTimeField === "open" ? openTime : closeTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                if (Platform.OS === "android") setActiveTimeField(null);
                if (!date) return;
                if (activeTimeField === "open") setOpenTime(date);
                else setCloseTime(date);
              }}
            />
          )}
        </View>

        {/* ── Location ── */}
        <View className="mb-6">
          <SectionLabel
            label="Location"
            sub="Describe where you're based or where you go to"
          />

               <View className="flex-row items-center justify-between bg-zinc-800  border-zinc-700 rounded-2xl px-4 h-[52px] mt-2 mb-3">
            <View className="flex-row items-center flex-1 pr-3">
              {/* <View className="w-9 h-9 rounded-full bg-orange-500/15 items-center justify-center mr-3">
                <Ionicons name="navigate-outline" size={16} color="#f97316" />
              </View> */}
              <View className="flex-1">
                <Text className="text-[13px] font-[Nunito-semibold] text-zinc-300">
                  Share live location
                </Text>
                <Text className="text-[11px] text-zinc-500 mt-0.5">
                  Let customers see where you are in real time
                </Text>
              </View>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: "#52525b", true: "#fdba74" }}
              thumbColor={locationSharing ? "#f97316" : "#d4d4d8"}
            />
          </View>

          <CustomInput
            placeholder="e.g. Behind Block C, or I come to you within campus"
            value={locationText}
            onChangeText={setLocationText}
            multiline
          />

   
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
          className="mt-4"
        >
          <View className="bg-orange-500 rounded-2xl h-[58px] flex-row items-center justify-center gap-2 shadow-sm">
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="rocket-outline" size={18} color="white" />
                <Text className="text-white font-black text-[16px] tracking-wide">
                  Launch my gig
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <Text className="text-center text-[11px] text-zinc-400 mt-3">
          Your gig will be reviewed before going live
        </Text>
      </ScrollView>
    </View>
  );
};

export default CreateService;