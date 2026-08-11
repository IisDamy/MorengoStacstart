import LocationDropdown from "@/components/LocationDropdown";
import CategoryDropdown from "@/components/ui/CategoryDropdown";
import CustomInput from "@/components/ui/CustomInput";
import MenuItemCard from "@/components/ui/MenuItemCard";
import { color } from "@/constants";
import { createMenuItem, createVendor, uploadImage } from "@/lib/appwrite";
import { useCordsStore } from "@/store/coords.store";
import { MenuItemDraft } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SectionLabel = ({ label, sub }: { label: string; sub?: string }) => (
  <View className="mb-3">
    <Text className="text-[14px] font-[Nunito-bold] text-zinc-800 tracking-wide">
      {label}
    </Text>
    {sub && (
      <Text className="text-[12px] text-zinc-400 mt-2 font-[Nunito-regular]">
        {sub}
      </Text>
    )}
  </View>
);

const TimeRow = ({
  open,
  closes,
  setOpen,
  setCloses,
}: {
  open: string;
  closes: string;
  setOpen: (t: string) => void;
  setCloses: (t: string) => void;
}) => (
  <View className="flex-row gap-3">
    <View className="flex-1">
      <Text className="text-[12px] font-[Nunito-semibold] text-zinc-500 mb-1.5 ml-1">
        Opens
      </Text>
      <View className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4">
        <Ionicons name="time-outline" size={16} color="#f97316" />
        <TextInput
          className="flex-1 ml-2 text-zinc-800 text-[14px] font-[Nunito-regular]"
          placeholder="e.g. 08:00 AM"
          placeholderTextColor="#9ca3af"
          value={open}
          onChangeText={setOpen}
        />
      </View>
    </View>
    <View className="flex-1">
      <Text className="text-[12px] font-[Nunito-semibold] text-zinc-500 mb-1.5 ml-1">
        Closes
      </Text>
      <View className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4">
        <Ionicons name="time-outline" size={16} color="#f97316" />
        <TextInput
          className="flex-1 ml-2 text-zinc-800 text-[14px]"
          placeholder="e.g. 10:00 PM"
          placeholderTextColor="#9ca3af"
          value={closes}
          onChangeText={setCloses}
        />
      </View>
    </View>
  </View>
);

// ─── Image Picker Helper ─────────────────────────────────────────────────────

const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission needed",
      "Please allow access to your photo library.",
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (!result.canceled && result.assets[0]) return result.assets[0].uri;
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────────────

const CreateStore = () => {
  const router = useRouter();
  const { locations } = useCordsStore();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [storeImageUri, setStoreImageUri] = useState<string | null>(null);
  const [storeImageId, setStoreImageId] = useState<string | null>(null);
  const [open, setOpen] = useState("");
  const [closes, setCloses] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleStoreImage = async () => {
    const uri = await pickImage();
    if (!uri) return;
    setStoreImageUri(uri);
    try {
      const id = await uploadImage(uri);
      setStoreImageId(id);
    } catch {
      Alert.alert(
        "Upload failed",
        "Could not upload store image. Please try again.",
      );
    }
  };

  const addMenuItem = () => {
    setMenuItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        price: "",
        imageUri: null,
        imageId: null,
      },
    ]);
  };

  const updateMenuItem = (
    id: string,
    field: keyof MenuItemDraft,
    value: string,
  ) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const removeMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMenuItemImage = async (id: string) => {
    const uri = await pickImage();
    if (!uri) return;
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, imageUri: uri } : item)),
    );
    try {
      const imgId = await uploadImage(uri);
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, imageId: imgId } : item,
        ),
      );
    } catch {
      Alert.alert("Upload failed", "Could not upload menu image.");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim())
      return Alert.alert("Missing info", "Please enter your store name.");
    if (!description.trim())
      return Alert.alert("Missing info", "Please add a brand story.");
    if (!open || !closes)
      return Alert.alert(
        "Missing info",
        "Please set opening and closing hours.",
      );
    if (categories.length === 0)
      return Alert.alert("Missing info", "Select at least one category.");

    setIsSubmitting(true);
    try {
      // You can wire ownerId from your auth store here
      await createVendor({
        name,
        description,
        imageUrl: storeImageId ?? undefined,
        open,
        closes,
        category: categories[0],
        ownerId: "replace-with-auth-user-id",
      });

      // Create menu items
      for (const item of menuItems) {
        if (item.name && item.price) {
          await createMenuItem(
            "replace-with-new-vendor-id",
            item.name,
            Number(item.price),
            item.imageId ?? "",
          );
        }
      }

      Alert.alert("Store created! 🎉", "Your store is now live.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="px-5 pt-4 pb-[15] border-b border-zinc-100">
        <Text
          className={`text-[16px] font-[Crispy] text-zinc-900 tracking-tight `}
          style={{ color: color.morange }}
        >
          Open your shop
        </Text>
        <Text className="text-[13px] font-[Nunito-medium] self-center  mt-[15] mx-4 text-zinc-400">
          Own your own chain of digital stores
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Store Image ── */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={handleStoreImage} activeOpacity={0.85}>
            <View className="w-[110px] h-[110px] rounded-[28px] bg-zinc-100 border-2 border-dashed border-zinc-300 items-center justify-center overflow-hidden">
              {storeImageUri ? (
                <Image
                  source={{ uri: storeImageUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center gap-1">
                  <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                    <Ionicons
                      name="storefront-outline"
                      size={20}
                      color="#f97316"
                    />
                  </View>
                  <Text className="text-[11px] text-zinc-400 font-[Nunito-medium]">
                    Store photo
                  </Text>
                </View>
              )}
            </View>
            {/* Edit badge */}
            <View
              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full  items-center justify-center border-2 border-white`}
              style={{
                backgroundColor: color.moregreen,
              }}
            >
              <Ionicons name="camera" size={12} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-[12px] text-zinc-400 mt-3 font-[Nunito-regular]">
            Tap to upload store photo
          </Text>
        </View>

        {/* ── Divider ── */}
        <View className="border-t border-zinc-100 mb-5" />

        {/* ── Store Name ── */}
        <View className="mb-5">
          <SectionLabel label="Store Name" />
          <CustomInput
            placeholder="e.g. Mama's Kitchen"
            value={name}
            onChangeText={setName}
            maxLength={12}
          />
          <Text className="text-[11px] text-zinc-400 mt-1.5 text-right font-[Nunito-regular]">
            {name.length}/12
          </Text>
        </View>

        {/* ── Brand Story ── */}
        <View className="mb-5">
          <SectionLabel
            label="Brand Story"
            sub="What makes your store special?"
          />
          <View className="relative">
            <CustomInput
              placeholder="Share your story — what you serve, your vibe, why customers will love you…"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={100}
            />
            <View className="absolute right-3 bottom-3">
              <MaterialIcons name="info-outline" size={15} color="#f97316" />
            </View>
          </View>
          <Text className="text-[11px] text-zinc-400 mt-1.5 text-right font-[Nunito-regular]">
            {description.length}/100
          </Text>
        </View>

        {/* ── Hours ── */}
        <View className="mb-5">
          <SectionLabel label="Opening Hours" />
          <TimeRow
            open={open}
            closes={closes}
            setOpen={setOpen}
            setCloses={setCloses}
          />
        </View>

        {/* ── Categories ── */}
        <View className="mb-6">
          <SectionLabel
            label="Categories"
            sub="Pick what best describes your menu"
          />
          <CategoryDropdown selected={categories} onSelect={setCategories} />
        </View>

        <View className="mb-6">
          <SectionLabel
            label="Location"
            sub="Show where your store is located"
          />
          <LocationDropdown
            locations={locations}
            onNavigate={() => router.push("/location")}
          />
        </View>

        {/* ── Divider ── */}
        <View className="flex-row items-center gap-3 mb-5">
          <View className="flex-1 border-t border-zinc-100" />
          <View className="bg-orange-50 rounded-full px-3 py-1">
            <Text className="text-[11px] font-bold text-orange-500 uppercase tracking-widest">
              Menu
            </Text>
          </View>
          <View className="flex-1 border-t border-zinc-100" />
        </View>

        {/* ── Menu Items ── */}
        <View className="mb-4">
          <SectionLabel
            label="Menu Items"
            sub={
              menuItems.length === 0
                ? "Add items customers can order"
                : `${menuItems.length} item${menuItems.length > 1 ? "s" : ""} added`
            }
          />

          {menuItems.length === 0 && (
            <View className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl py-8 items-center mb-3">
              <View className="w-12 h-12 rounded-2xl bg-orange-100 items-center justify-center mb-2">
                <Ionicons name="fast-food-outline" size={22} color="#f97316" />
              </View>
              <Text className="text-[13px] text-zinc-500 font-medium">
                No menu items yet
              </Text>
              <Text className="text-[11px] text-zinc-400 mt-0.5">
                Tap below to add your first dish
              </Text>
            </View>
          )}

          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onUpdate={updateMenuItem}
              onRemove={removeMenuItem}
              onPickImage={handleMenuItemImage}
            />
          ))}

          {/* Add item button */}
          <TouchableOpacity
            onPress={addMenuItem}
            className="border-2 border-dashed border-orange-300 rounded-2xl h-[52px] flex-row items-center justify-center gap-2 bg-orange-50"
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={18} color="#f97316" />
            <Text className="text-[14px] font-semibold text-orange-500">
              Add menu item
            </Text>
          </TouchableOpacity>
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
                  Launch my store
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <Text className="text-center text-[11px] text-zinc-400 mt-3">
          Your store will be reviewed before going live
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateStore;
