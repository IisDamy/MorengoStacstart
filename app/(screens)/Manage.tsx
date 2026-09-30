import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Switch,
  TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import useAuthStore from "@/store/auth.store";
import {
  getVendors,
  getEvents,
  getMenuItems,
  displayImage,
  uploadImage,
  tablesDB,
  appwriteConfig,
  ID,
} from "@/lib/appwrite";
import { Vendor, EventPayload, MenuItem, ServiceOffer } from "@/types";

type EventDocument = EventPayload & { $id: string };

// ---------- Palette (one place to tweak) ----------
const C = {
  ink: "#0F2E24", // deep forest, the "letterhead" colour
  inkSoft: "#1C4536",
  orange: "#FF8C00",
  green: "#57a886",
  bg: "#F3F5F4",
  line: "#E4E8E6",
  muted: "#6B7A73",
  text: "#14201B",
  blue: "#3B82F6",
  red: "#DC2626",
};

// ---------- Helpers ----------
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const toMinutes = (t?: string) => {
  const m = t?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (m[3]?.toUpperCase() === "PM") h += 12;
  else if (!m[3]) h = parseInt(m[1], 10); // 24h input
  return h * 60 + parseInt(m[2], 10);
};

const isOpenNow = (open?: string, closes?: string) => {
  const o = toMinutes(open || "09:00 AM");
  const c = toMinutes(closes || "09:00 PM");
  if (o === null || c === null) return false;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  return o <= c ? now >= o && now < c : now >= o || now < c; // handles overnight
};

// ---------- Small reusable pieces ----------
const Field = ({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) => (
  <View className="mb-4">
    <Text className="text-[12px] font-[Nunito-semiBold] mb-1.5" style={{ color: C.text }}>
      {label}
    </Text>
    <TextInput
      placeholderTextColor="#9AA7A0"
      className="px-4 py-3 rounded-xl border text-[13px] font-[Nunito-Regular]"
      style={{ borderColor: C.line, backgroundColor: "#FAFBFA", color: C.text }}
      {...props}
    />
    {hint ? (
      <Text className="text-[11px] font-[Nunito-Regular] mt-1" style={{ color: C.muted }}>
        {hint}
      </Text>
    ) : null}
  </View>
);

const ModalShell = ({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="px-5 py-4 flex-row justify-between items-center border-b"
        style={{ borderColor: C.line }}
      >
        <View className="flex-1 pr-3">
          <Text className="text-lg font-[Nunito-Bold]" style={{ color: C.text }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs font-[Nunito-Regular]" style={{ color: C.muted }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: C.bg }}
        >
          <Ionicons name="close" size={20} color={C.text} />
        </TouchableOpacity>
      </View>
      {children}
    </SafeAreaView>
  </Modal>
);

const PrimaryButton = ({
  label,
  loading,
  onPress,
  color = C.orange,
}: {
  label: string;
  loading?: boolean;
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    className="py-3.5 rounded-xl items-center"
    style={{ backgroundColor: color, opacity: loading ? 0.7 : 1 }}
  >
    {loading ? (
      <ActivityIndicator color="#FFF" size="small" />
    ) : (
      <Text className="text-[13px] font-[Nunito-Bold] text-white">{label}</Text>
    )}
  </TouchableOpacity>
);

const StatusPill = ({ open }: { open: boolean }) => (
  <View
    className="flex-row items-center px-2.5 py-1 rounded-full"
    style={{ backgroundColor: open ? "#E3F5EC" : "#F1F3F2" }}
  >
    <View
      className="w-1.5 h-1.5 rounded-full mr-1.5"
      style={{ backgroundColor: open ? "#16A36A" : "#9AA7A0" }}
    />
    <Text
      className="text-[11px] font-[Nunito-Bold]"
      style={{ color: open ? "#0E7A4F" : C.muted }}
    >
      {open ? "Open now" : "Closed"}
    </Text>
  </View>
);

// =============================================================
export default function ManageBrandsScreen() {
  const { user } = useAuthStore();

  // Page state
  const [activeTab, setActiveTab] = useState<"stores" | "events">("stores");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myVendors, setMyVendors] = useState<Vendor[]>([]);
  const [myEvents, setMyEvents] = useState<EventDocument[]>([]);

  // Menu modal
  const [selectedVendorForMenu, setSelectedVendorForMenu] = useState<Vendor | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [vendorMenuItems, setVendorMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);

  // Vendor modal
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<Vendor | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editVendorName, setEditVendorName] = useState("");
  const [editVendorDesc, setEditVendorDesc] = useState("");
  const [editVendorOpen, setEditVendorOpen] = useState("");
  const [editVendorCloses, setEditVendorCloses] = useState("");
  const [editVendorImage, setEditVendorImage] = useState<string | null>(null);
  const [isSavingVendor, setIsSavingVendor] = useState(false);

  // Event modal
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<EventDocument | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editEventName, setEditEventName] = useState("");
  const [editEventDesc, setEditEventDesc] = useState("");
  const [editEventOpenTime, setEditEventOpenTime] = useState("");
  const [editEventCloseTime, setEditEventCloseTime] = useState("");
  const [editEventOffers, setEditEventOffers] = useState<ServiceOffer[]>([]);
  const [newOfferName, setNewOfferName] = useState("");
  const [newOfferPrice, setNewOfferPrice] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // ---------- Personalisation ----------
  const firstName = user?.name?.trim().split(" ")[0] || "there";
  const avatarUri = user?.PhotoUrl || user?.avatar;
  const businessId = `MRG-${(user?.$id || user?.accountId || "000000").slice(-6).toUpperCase()}`;
  const openStores = useMemo(
    () => myVendors.filter((v) => isOpenNow(v.open, v.closes)).length,
    [myVendors]
  );
  const verifiedCount = myVendors.filter((v) => v.verified).length;

  // ---------- Data ----------
  const fetchBrands = async () => {
    if (!user?.$id && !user?.accountId) return;
    try {
      const currentId = user.$id;
      const [allVendors, allEvents] = await Promise.all([getVendors({}), getEvents()]);
      setMyVendors((allVendors as Vendor[]).filter((v) => v.ownerId === currentId));
      setMyEvents((allEvents as EventDocument[]).filter((e) => e.userId === currentId));
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBrands();
  };

  const pickImage = async (onSelected: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) onSelected(result.assets[0].uri);
  };

  const resolveImageUri = (src?: string) => {
    if (!src) return "https://via.placeholder.com/300";
    if (/^(https?|file):\/\//.test(src)) return src;
    return displayImage(src);
  };

  // ---------- Menu handlers ----------
  const openMenuManager = async (vendor: Vendor) => {
    setSelectedVendorForMenu(vendor);
    setIsMenuModalOpen(true);
    setLoadingMenu(true);
    try {
      if (vendor.$id) {
        const items = await getMenuItems({ vendors: vendor.$id });
        setVendorMenuItems(items as MenuItem[]);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      Alert.alert("Couldn't load menu", "Check your connection and try again.");
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleAddMenuItem = async () => {
    if (!selectedVendorForMenu?.$id) return;
    if (!newItemName.trim() || !newItemPrice.trim()) {
      Alert.alert("Missing details", "Enter an item name and a price.");
      return;
    }
    setIsAddingMenuItem(true);
    try {
      let imageFileId = "";
      if (newItemImage) imageFileId = await uploadImage(newItemImage);

      await tablesDB.createRow({
        databaseId: appwriteConfig.databaseId,
        tableId: "menu",
        rowId: ID.unique(),
        data: {
          vendors: selectedVendorForMenu.$id,
          name: newItemName.trim(),
          price: parseFloat(newItemPrice),
          image: imageFileId,
          isAvailable: true,
        },
      });

      setNewItemName("");
      setNewItemPrice("");
      setNewItemImage(null);
      const updated = await getMenuItems({ vendors: selectedVendorForMenu.$id });
      setVendorMenuItems(updated as MenuItem[]);
    } catch (e: any) {
      Alert.alert("Couldn't add item", e.message || "Try again.");
    } finally {
      setIsAddingMenuItem(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    // optimistic update
    setVendorMenuItems((prev) =>
      prev.map((i) => (i.$id === item.$id ? { ...i, isAvailable: newStatus } : i))
    );
    try {
      await tablesDB.updateRow({
        databaseId: appwriteConfig.databaseId,
        tableId: "menu",
        rowId: item.$id,
        data: { isAvailable: newStatus },
      });
    } catch (e) {
      setVendorMenuItems((prev) =>
        prev.map((i) => (i.$id === item.$id ? { ...i, isAvailable: !newStatus } : i))
      );
      Alert.alert("Couldn't update", "Availability wasn't changed. Try again.");
    }
  };

  const handleDeleteMenuItem = (itemId: string) => {
    Alert.alert("Remove item?", "This item will be removed from your menu.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await tablesDB.deleteRow({
              databaseId: appwriteConfig.databaseId,
              tableId: "menu",
              rowId: itemId,
            });
            setVendorMenuItems((prev) => prev.filter((i) => i.$id !== itemId));
          } catch (e) {
            Alert.alert("Couldn't remove item", "Try again.");
          }
        },
      },
    ]);
  };

  // ---------- Vendor handlers ----------
  const openVendorEditor = (vendor: Vendor) => {
    setSelectedVendorForEdit(vendor);
    setEditVendorName(vendor.name || "");
    setEditVendorDesc(vendor.description || "");
    setEditVendorOpen(vendor.open || "");
    setEditVendorCloses(vendor.closes || "");
    setEditVendorImage(vendor.imageUrl || null);
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = async () => {
    if (!selectedVendorForEdit?.$id) return;
    setIsSavingVendor(true);
    try {
      let finalImg = editVendorImage;
      if (editVendorImage?.startsWith("file://")) finalImg = await uploadImage(editVendorImage);

      await tablesDB.updateRow({
        databaseId: appwriteConfig.databaseId,
        tableId: "vendors",
        rowId: selectedVendorForEdit.$id,
        data: {
          name: editVendorName,
          description: editVendorDesc,
          open: editVendorOpen,
          closes: editVendorCloses,
          imageUrl: finalImg,
        },
      });
      setIsVendorModalOpen(false);
      fetchBrands();
    } catch (e: any) {
      Alert.alert("Couldn't save changes", e.message || "Try again.");
    } finally {
      setIsSavingVendor(false);
    }
  };

  // ---------- Event handlers ----------
  const openEventEditor = (event: EventDocument) => {
    setSelectedEventForEdit(event);
    setEditEventName(event.name || "");
    setEditEventDesc(event.description || "");
    setEditEventOpenTime(event.openTime || "");
    setEditEventCloseTime(event.closeTime || "");
    try {
      setEditEventOffers(JSON.parse(event.offers || "[]"));
    } catch {
      setEditEventOffers([]);
    }
    setIsEventModalOpen(true);
  };

  const handleAddOffer = () => {
    if (!newOfferName.trim() || !newOfferPrice.trim()) return;
    setEditEventOffers((prev) => [
      ...prev,
      { name: newOfferName.trim(), price: parseFloat(newOfferPrice) },
    ]);
    setNewOfferName("");
    setNewOfferPrice("");
  };

  const handleSaveEvent = async () => {
    if (!selectedEventForEdit?.$id) return;
    setIsSavingEvent(true);
    try {
      await tablesDB.updateRow({
        databaseId: appwriteConfig.databaseId,
        tableId: "event",
        rowId: selectedEventForEdit.$id,
        data: {
          name: editEventName,
          description: editEventDesc,
          openTime: editEventOpenTime,
          closeTime: editEventCloseTime,
          offers: JSON.stringify(editEventOffers),
        },
      });
      setIsEventModalOpen(false);
      fetchBrands();
    } catch (e: any) {
      Alert.alert("Couldn't save event", e.message || "Try again.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  // =============================================================
  // RENDER
  // =============================================================
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.orange} />
        <Text className="font-[Nunito-semiBold] mt-4" style={{ color: C.muted }}>
          Opening your business office...
        </Text>
      </SafeAreaView>
    );
  }

  const Stat = ({ value, label }: { value: string | number; label: string }) => (
    <View className="flex-1">
      <Text className="text-2xl font-[Nunito-Bold] text-white">{value}</Text>
      <Text className="text-[11px] font-[Nunito-Regular]" style={{ color: "#A9C4B8" }}>
        {label}
      </Text>
    </View>
  );

  const QuickAction = ({
    icon,
    label,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center py-3.5 rounded-2xl bg-white border"
      style={{ borderColor: C.line }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-1.5"
        style={{ backgroundColor: "#EAF3EF" }}
      >
        <Ionicons name={icon} size={20} color={C.inkSoft} />
      </View>
      <Text className="text-[12px] font-[Nunito-semiBold]" style={{ color: C.text }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.ink }} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: C.bg }}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.orange} />
        }
      >
        {/* ---------- Letterhead ---------- */}
        <View className="px-5 pt-3 pb-16" style={{ backgroundColor: C.ink }}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: C.inkSoft }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-[13px] absolute left-1/2 -translate-x-1/2 uppercase font-[Nunito-semiBold]" style={{ color: "#A9C4B8" }}>
              My Office
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/Choosecreatetype")}
              className="flex-row items-center px-3.5 py-2.5 rounded-full"
              style={{ backgroundColor: C.orange }}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text className="text-xs font-[Nunito-Bold] text-white ml-1">New</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mt-6">
            {avatarUri ? (
              <Image
                source={{ uri: resolveImageUri(avatarUri) }}
                className="w-16 h-16 rounded-2xl"
                style={{ backgroundColor: C.inkSoft }}
              />
            ) : (
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: C.inkSoft }}
              >
                <Text className="text-2xl font-[Nunito-Bold] text-white">
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View className="ml-4 flex-1">
              <Text className="text-[13px] font-[Nunito-Regular]" style={{ color: "#A9C4B8" }}>
                {greeting()},
              </Text>
              <Text className="text-2xl font-[Nunito-Bold] text-white" numberOfLines={1}>
                {user?.name || "Business Owner"}
              </Text>
              <Text className="text-xs font-[Nunito-Regular] mt-0.5" style={{ color: "#A9C4B8" }} numberOfLines={1}>
                {user?.institution ? `Serving ${user.institution}` : "Morengo Merchant"}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- Business summary (overlaps letterhead) ---------- */}
        <View className="px-5 -mt-10">
          <View
            className="rounded-3xl p-5"
            style={{ backgroundColor: C.inkSoft, borderWidth: 1, borderColor: "#2C5A47" }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-[11px] font-[Nunito-Regular]" style={{ color: "#A9C4B8" }}>
                  Business ID
                </Text>
                <Text className="text-base font-[Nunito-Bold] text-white tracking-widest">
                  {businessId}
                </Text>
              </View>
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{ backgroundColor: verifiedCount > 0 ? "#E3F5EC" : "#FFF3E0" }}
              >
                <Ionicons
                  name={verifiedCount > 0 ? "shield-checkmark" : "time-outline"}
                  size={14}
                  color={verifiedCount > 0 ? "#0E7A4F" : "#B86400"}
                />
                <Text
                  className="text-[11px] font-[Nunito-Bold] ml-1"
                  style={{ color: verifiedCount > 0 ? "#0E7A4F" : "#B86400" }}
                >
                  {verifiedCount > 0 ? "Verified merchant" : "Verification pending"}
                </Text>
              </View>
            </View>

            <View className="h-[1px] mb-4" style={{ backgroundColor: "#2C5A47" }} />

            <View className="flex-row">
              <Stat value={myVendors.length} label="Stores" />
              <Stat value={openStores} label="Open now" />
              <Stat value={myEvents.length} label="Events" />
              <Stat value={(user?.points ?? 0).toLocaleString()} label="Points" />
            </View>
          </View>
        </View>

        {/* ---------- Quick actions ---------- */}
        <View className="px-5 mt-4 flex-row" style={{ gap: 10 }}>
          <QuickAction icon="receipt-outline" label="Orders" onPress={() => router.push("/OrderDelivery")} />
          <QuickAction
            icon="storefront-outline"
            label="Add store"
            onPress={() => router.push("/CreateStore")}
          />
          <QuickAction
            icon="restaurant-outline"
            label="Menus"
            onPress={() => {
              if (myVendors.length === 0) return Alert.alert("No store yet", "Create a store to manage its menu.");
              if (myVendors.length === 1) return openMenuManager(myVendors[0]);
              setActiveTab("stores");
              Alert.alert("Choose a store", "Tap Menu on the store you want to update.");
            }}
          />
        </View>

        {/* ---------- Tabs ---------- */}
        <View className="px-5 mt-6">
          <View className="flex-row border-b" style={{ borderColor: C.line }}>
            {(["stores", "events"] as const).map((tab) => {
              const active = activeTab === tab;
              const count = tab === "stores" ? myVendors.length : myEvents.length;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className="mr-7 pb-3"
                  style={{
                    borderBottomWidth: 2,
                    borderBottomColor: active ? C.orange : "transparent",
                    marginBottom: -1,
                  }}
                >
                  <Text
                    className="text-[15px] font-[Nunito-Bold]"
                    style={{ color: active ? C.text : C.muted }}
                  >
                    {tab === "stores" ? "My stores" : "My events"}{" "}
                    <Text style={{ color: active ? C.orange : C.muted }}>{count}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ---------- Lists ---------- */}
        <View className="px-5 mt-4">
          {activeTab === "stores" ? (
            myVendors.length === 0 ? (
              <View
                className="bg-white p-8 rounded-3xl border items-center"
                style={{ borderColor: C.line }}
              >
                <Ionicons name="storefront-outline" size={44} color={C.green} />
                <Text className="text-base font-[Nunito-Bold] mt-3" style={{ color: C.text }}>
                  Open your first store
                </Text>
                <Text
                  className="text-xs font-[Nunito-Regular] text-center mt-1 mb-4"
                  style={{ color: C.muted }}
                >
                  Add your business name, hours and menu so customers can start ordering.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/Choosecreatetype")}
                  className="px-5 py-3 rounded-full"
                  style={{ backgroundColor: C.orange }}
                >
                  <Text className="text-xs font-[Nunito-Bold] text-white">Create a store</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myVendors.map((vendor) => (
                <View
                  key={vendor.$id}
                  className="bg-white rounded-3xl mb-4 border overflow-hidden"
                  style={{ borderColor: C.line }}
                >
                  <View>
                    <Image
                      source={{ uri: resolveImageUri(vendor.imageUrl) }}
                      className="w-full h-32"
                      style={{ backgroundColor: C.bg }}
                      resizeMode="cover"
                    />
                    <View className="absolute top-3 left-3">
                      <StatusPill open={isOpenNow(vendor.open, vendor.closes)} />
                    </View>
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-center">
                      <Text
                        className="text-[17px] font-[Nunito-Bold] flex-shrink"
                        style={{ color: C.text }}
                        numberOfLines={1}
                      >
                        {vendor.name || "Unnamed store"}
                      </Text>
                      {vendor.verified && (
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color="#16A36A"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                    <Text
                      className="text-xs font-[Nunito-Regular] mt-1"
                      style={{ color: C.muted }}
                      numberOfLines={2}
                    >
                      {vendor.description || "Add a description so customers know what you offer."}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="time-outline" size={13} color={C.muted} />
                      <Text className="text-[12px] font-[Nunito-Meduim] ml-1" style={{ color: C.muted }}>
                        {vendor.open || "09:00 AM"} to {vendor.closes || "09:00 PM"}
                      </Text>
                    </View>

                    <View className="flex-row mt-4" style={{ gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => openMenuManager(vendor)}
                        className="flex-1 py-3 rounded-xl flex-row justify-center items-center"
                        style={{ backgroundColor: C.ink }}
                      >
                        <Ionicons name="restaurant-outline" size={16} color="#FFF" />
                        <Text className="font-[Nunito-semiBold] text-xs text-white ml-1.5">
                          Manage menu
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openVendorEditor(vendor)}
                        className="flex-1 py-3 rounded-xl flex-row justify-center items-center border"
                        style={{ borderColor: C.line }}
                      >
                        <Ionicons name="create-outline" size={16} color={C.text} />
                        <Text className="font-[Nunito-semiBold] text-xs ml-1.5" style={{ color: C.text }}>
                          Edit details
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )
          ) : myEvents.length === 0 ? (
            <View
              className="bg-white p-8 rounded-3xl border items-center"
              style={{ borderColor: C.line }}
            >
              <Ionicons name="calendar-outline" size={44} color={C.blue} />
              <Text className="text-base font-[Nunito-Bold] mt-3" style={{ color: C.text }}>
                Host your first event
              </Text>
              <Text
                className="text-xs font-[Nunito-Regular] text-center mt-1 mb-4"
                style={{ color: C.muted }}
              >
                Publish a one-off event or a weekly service with priced packages.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/CreateEvent")}
                className="px-5 py-3 rounded-full"
                style={{ backgroundColor: C.blue }}
              >
                <Text className="text-xs font-[Nunito-Bold] text-white">Create an event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            myEvents.map((event) => {
              let offerCount = 0;
              try {
                offerCount = JSON.parse(event.offers || "[]").length;
              } catch {}
              return (
                <View
                  key={event.$id}
                  className="bg-white rounded-3xl mb-4 border p-4"
                  style={{ borderColor: C.line }}
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center"
                      style={{ backgroundColor: "#EAF1FE" }}
                    >
                      <Ionicons name="ticket-outline" size={24} color={C.blue} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        className="text-[16px] font-[Nunito-Bold]"
                        style={{ color: C.text }}
                        numberOfLines={1}
                      >
                        {event.name}
                      </Text>
                      <Text className="text-xs font-[Nunito-Regular] mt-0.5" style={{ color: C.muted }}>
                        {event.weekly ? `Every ${event.dotw}` : "One-time event"}
                        {event.type ? `, ${event.type}` : ""}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row mt-4 pt-3 border-t" style={{ borderColor: C.line }}>
                    <View className="flex-1">
                      <Text className="text-[11px] font-[Nunito-Regular]" style={{ color: C.muted }}>
                        Hours
                      </Text>
                      <Text className="text-[13px] font-[Nunito-semiBold]" style={{ color: C.text }}>
                        {event.openTime} to {event.closeTime}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-[Nunito-Regular]" style={{ color: C.muted }}>
                        Packages
                      </Text>
                      <Text className="text-[13px] font-[Nunito-semiBold]" style={{ color: C.text }}>
                        {offerCount} offer{offerCount === 1 ? "" : "s"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => openEventEditor(event)}
                      className="px-4 py-2.5 rounded-xl self-center"
                      style={{ backgroundColor: C.blue }}
                    >
                      <Text className="text-xs font-[Nunito-semiBold] text-white">Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ================= MENU MODAL ================= */}
      <ModalShell
        visible={isMenuModalOpen}
        title="Menu"
        subtitle={selectedVendorForMenu?.name}
        onClose={() => setIsMenuModalOpen(false)}
      >
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          <View
            className="p-4 rounded-2xl border mb-6"
            style={{ backgroundColor: "#FFF8EE", borderColor: "#FFE1B8" }}
          >
            <Text className="text-sm font-[Nunito-Bold] mb-3" style={{ color: "#B86400" }}>
              Add an item
            </Text>
            <Field
              label="Item name"
              placeholder="e.g. Jollof rice combo"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <View className="flex-row items-end" style={{ gap: 8 }}>
              <View className="flex-1">
                <Field
                  label="Price (₦)"
                  placeholder="2500"
                  keyboardType="numeric"
                  value={newItemPrice}
                  onChangeText={setNewItemPrice}
                />
              </View>
              <TouchableOpacity
                onPress={() => pickImage(setNewItemImage)}
                className="mb-4 px-4 py-3 rounded-xl border flex-row items-center bg-white"
                style={{ borderColor: C.line }}
              >
                <Ionicons
                  name={newItemImage ? "checkmark-circle" : "image-outline"}
                  size={16}
                  color={newItemImage ? "#16A36A" : C.text}
                />
                <Text className="text-xs font-[Nunito-semiBold] ml-1" style={{ color: C.text }}>
                  {newItemImage ? "Photo added" : "Photo"}
                </Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton label="Add to menu" loading={isAddingMenuItem} onPress={handleAddMenuItem} />
          </View>

          <Text className="text-sm font-[Nunito-Bold] mb-3" style={{ color: C.text }}>
            On your menu ({vendorMenuItems.length}
            {vendorMenuItems.length > 0
              ? `, ${vendorMenuItems.filter((i) => i.isAvailable).length} available`
              : ""}
            )
          </Text>

          {loadingMenu ? (
            <ActivityIndicator color={C.orange} className="my-6" />
          ) : vendorMenuItems.length === 0 ? (
            <Text className="text-xs font-[Nunito-Regular] text-center my-6" style={{ color: C.muted }}>
              Your menu is empty. Add your first item above.
            </Text>
          ) : (
            vendorMenuItems.map((item) => (
              <View
                key={item.$id}
                className="bg-white p-3 rounded-2xl mb-3 border flex-row items-center justify-between"
                style={{ borderColor: C.line, opacity: item.isAvailable ? 1 : 0.65 }}
              >
                <View className="flex-row items-center flex-1 pr-2">
                  <Image
                    source={{ uri: resolveImageUri(item.image) }}
                    className="w-12 h-12 rounded-xl mr-3"
                    style={{ backgroundColor: C.bg }}
                  />
                  <View className="flex-1">
                    <Text className="text-[13px] font-[Nunito-Bold]" style={{ color: C.text }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-xs font-[Nunito-Meduim] mt-0.5" style={{ color: C.orange }}>
                      ₦{item.price?.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  <View className="items-center">
                    <Text className="text-[10px] font-[Nunito-Regular]" style={{ color: C.muted }}>
                      {item.isAvailable ? "Available" : "Sold out"}
                    </Text>
                    <Switch
                      value={item.isAvailable}
                      onValueChange={() => handleToggleAvailability(item)}
                      trackColor={{ false: "#E5E7EB", true: "#BFE3D2" }}
                      thumbColor={item.isAvailable ? C.green : "#9CA3AF"}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteMenuItem(item.$id)}
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: "#FEECEC" }}
                  >
                    <Ionicons name="trash-outline" size={16} color={C.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View className="h-10" />
        </ScrollView>
      </ModalShell>

      {/* ================= STORE MODAL ================= */}
      <ModalShell
        visible={isVendorModalOpen}
        title="Store details"
        subtitle={selectedVendorForEdit?.name}
        onClose={() => setIsVendorModalOpen(false)}
      >
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => pickImage(setEditVendorImage)}
            className="w-full h-40 rounded-2xl justify-center items-center overflow-hidden border mb-5"
            style={{ backgroundColor: C.bg, borderColor: C.line }}
          >
            {editVendorImage ? (
              <Image
                source={{ uri: resolveImageUri(editVendorImage) }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="camera-outline" size={28} color={C.muted} />
                <Text className="text-xs font-[Nunito-Meduim] mt-1" style={{ color: C.muted }}>
                  Add a cover photo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Field label="Store name" value={editVendorName} onChangeText={setEditVendorName} />
          <Field
            label="Description"
            value={editVendorDesc}
            onChangeText={setEditVendorDesc}
            multiline
            numberOfLines={3}
            style={{ minHeight: 84, textAlignVertical: "top" }}
          />
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1">
              <Field
                label="Opens"
                placeholder="08:00 AM"
                value={editVendorOpen}
                onChangeText={setEditVendorOpen}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Closes"
                placeholder="10:00 PM"
                value={editVendorCloses}
                onChangeText={setEditVendorCloses}
              />
            </View>
          </View>
          <PrimaryButton label="Save changes" loading={isSavingVendor} onPress={handleSaveVendor} />
          <View className="h-10" />
        </ScrollView>
      </ModalShell>

      {/* ================= EVENT MODAL ================= */}
      <ModalShell
        visible={isEventModalOpen}
        title="Event details"
        subtitle={selectedEventForEdit?.name}
        onClose={() => setIsEventModalOpen(false)}
      >
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          <Field label="Event title" value={editEventName} onChangeText={setEditEventName} />
          <Field
            label="Description"
            value={editEventDesc}
            onChangeText={setEditEventDesc}
            multiline
            numberOfLines={3}
            style={{ minHeight: 84, textAlignVertical: "top" }}
          />
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1">
              <Field label="Starts" value={editEventOpenTime} onChangeText={setEditEventOpenTime} />
            </View>
            <View className="flex-1">
              <Field label="Ends" value={editEventCloseTime} onChangeText={setEditEventCloseTime} />
            </View>
          </View>

          <View className="pt-4 mt-1 border-t" style={{ borderColor: C.line }}>
            <Text className="text-sm font-[Nunito-Bold] mb-3" style={{ color: C.text }}>
              Packages and offers
            </Text>
            <View className="flex-row mb-3" style={{ gap: 8 }}>
              <TextInput
                placeholder="Offer name"
                placeholderTextColor="#9AA7A0"
                value={newOfferName}
                onChangeText={setNewOfferName}
                className="flex-1 px-3 py-2.5 rounded-xl border text-xs font-[Nunito-Regular]"
                style={{ borderColor: C.line, backgroundColor: "#FAFBFA" }}
              />
              <TextInput
                placeholder="₦ Price"
                placeholderTextColor="#9AA7A0"
                keyboardType="numeric"
                value={newOfferPrice}
                onChangeText={setNewOfferPrice}
                className="w-24 px-3 py-2.5 rounded-xl border text-xs font-[Nunito-Regular]"
                style={{ borderColor: C.line, backgroundColor: "#FAFBFA" }}
              />
              <TouchableOpacity
                onPress={handleAddOffer}
                className="px-3 rounded-xl justify-center items-center"
                style={{ backgroundColor: C.blue }}
              >
                <Ionicons name="add" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {editEventOffers.map((offer, idx) => (
              <View
                key={idx}
                className="px-3 py-2.5 rounded-xl flex-row justify-between items-center mb-2 border"
                style={{ backgroundColor: "#F4F8FF", borderColor: "#DCE8FD" }}
              >
                <Text className="text-xs font-[Nunito-semiBold]" style={{ color: C.text }}>
                  {offer.name}
                  <Text style={{ color: C.blue }}>{"  "}₦{Number(offer.price).toLocaleString()}</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setEditEventOffers((p) => p.filter((_, i) => i !== idx))}
                >
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View className="mt-4">
            <PrimaryButton
              label="Save event"
              color={C.blue}
              loading={isSavingEvent}
              onPress={handleSaveEvent}
            />
          </View>
          <View className="h-10" />
        </ScrollView>
      </ModalShell>
    </SafeAreaView>
  );
}