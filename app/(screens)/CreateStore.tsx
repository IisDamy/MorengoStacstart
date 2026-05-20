import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { uploadImage, createVendor, createMenuItem } from '@/lib/appwrite'
import { useCordsStore } from '@/store/coords.store'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItemDraft {
  id: string
  name: string
  price: string
  imageUri: string | null
  imageId: string | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Fast Food',
  'African',
  'Drinks & Smoothies',
  'Shawarma',
  'Snacks',
  'Pizza',
  'Healthy',
  'Pastries',
  'Rice & Swallows',
  'Grills',
]

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionLabel = ({ label, sub }: { label: string; sub?: string }) => (
  <View className="mb-3">
    <Text className="text-[15px] font-bold text-zinc-800 tracking-wide">{label}</Text>
    {sub && <Text className="text-[12px] text-zinc-400 mt-0.5">{sub}</Text>}
  </View>
)

const StyledInput = ({
  placeholder,
  value,
  onChangeText,
  multiline,
  keyboardType,
  maxLength,
}: {
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  multiline?: boolean
  keyboardType?: any
  maxLength?: number
}) => (
  <TextInput
    className={`bg-zinc-100 border border-zinc-200 rounded-2xl px-4 text-zinc-800 text-[14px] ${
      multiline ? 'h-[100px] py-3' : 'h-[52px]'
    }`}
    placeholder={placeholder}
    placeholderTextColor="#9ca3af"
    value={value}
    onChangeText={onChangeText}
    multiline={multiline}
    textAlignVertical={multiline ? 'top' : 'center'}
    keyboardType={keyboardType || 'default'}
    maxLength={maxLength}
    autoCapitalize="none"
    autoCorrect={false}
  />
)

const TimeRow = ({
  open,
  closes,
  setOpen,
  setCloses,
}: {
  open: string
  closes: string
  setOpen: (t: string) => void
  setCloses: (t: string) => void
}) => (
  <View className="flex-row gap-3">
    <View className="flex-1">
      <Text className="text-[12px] font-semibold text-zinc-500 mb-1.5 ml-1">Opens</Text>
      <View className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4">
        <Ionicons name="time-outline" size={16} color="#f97316" />
        <TextInput
          className="flex-1 ml-2 text-zinc-800 text-[14px]"
          placeholder="e.g. 08:00 AM"
          placeholderTextColor="#9ca3af"
          value={open}
          onChangeText={setOpen}
        />
      </View>
    </View>
    <View className="flex-1">
      <Text className="text-[12px] font-semibold text-zinc-500 mb-1.5 ml-1">Closes</Text>
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
)

// ─── Image Picker Helper ─────────────────────────────────────────────────────

const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to your photo library.')
    return null
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  })
  if (!result.canceled && result.assets[0]) return result.assets[0].uri
  return null
}

// ─── Menu Item Card ──────────────────────────────────────────────────────────

const MenuItemCard = ({
  item,
  onUpdate,
  onRemove,
  onPickImage,
}: {
  item: MenuItemDraft
  onUpdate: (id: string, field: keyof MenuItemDraft, value: string) => void
  onRemove: (id: string) => void
  onPickImage: (id: string) => void
}) => (
  <View className="bg-white border border-zinc-100 rounded-2xl p-4 mb-3 shadow-sm">
    {/* Image + Remove Row */}
    <View className="flex-row items-start gap-3 mb-3">
      <TouchableOpacity
        onPress={() => onPickImage(item.id)}
        className="w-[72px] h-[72px] rounded-xl bg-zinc-100 border-2 border-dashed border-zinc-300 items-center justify-center overflow-hidden"
      >
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="items-center">
            <Ionicons name="image-outline" size={24} color="#d4d4d8" />
            <Text className="text-[10px] text-zinc-400 mt-1">Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View className="flex-1 gap-2">
        <TextInput
          className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 h-[44px] text-[13px] text-zinc-800"
          placeholder="Item name"
          placeholderTextColor="#9ca3af"
          value={item.name}
          onChangeText={(t) => onUpdate(item.id, 'name', t)}
        />
        <View className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 h-[44px] flex-row items-center">
          <Text className="text-orange-500 font-bold text-[14px] mr-1">₦</Text>
          <TextInput
            className="flex-1 text-[13px] text-zinc-800"
            placeholder="Price"
            placeholderTextColor="#9ca3af"
            value={item.price}
            onChangeText={(t) => onUpdate(item.id, 'price', t)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        className="w-7 h-7 rounded-full bg-red-50 items-center justify-center"
      >
        <Ionicons name="close" size={14} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
)

// ─── Category Dropdown ──────────────────────────────────────────────────────

const CategoryDropdown = ({
  selected,
  onSelect,
}: {
  selected: string[]
  onSelect: (cats: string[]) => void
}) => {
  const [open, setOpen] = useState(false)

  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onSelect(selected.filter((c) => c !== cat))
    } else {
      onSelect([...selected, cat])
    }
  }

  return (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4 justify-between"
      >
        <Text className={`text-[14px] ${selected.length ? 'text-zinc-800' : 'text-zinc-400'}`}>
          {selected.length ? selected.join(', ') : 'Select categories'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
      </TouchableOpacity>

      {/* Selected chips */}
      {selected.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-2">
          {selected.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => toggle(cat)}
              className="flex-row items-center bg-orange-50 border border-orange-200 rounded-full px-3 py-1 gap-1"
            >
              <Text className="text-[12px] text-orange-600 font-semibold">{cat}</Text>
              <Ionicons name="close-circle" size={13} color="#f97316" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpen(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[17px] font-bold text-zinc-800">Pick categories</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#71717a" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              numColumns={2}
              columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
              renderItem={({ item: cat }) => {
                const isSelected = selected.includes(cat)
                return (
                  <TouchableOpacity
                    onPress={() => toggle(cat)}
                    className={`flex-1 rounded-xl py-3 px-3 border flex-row items-center gap-2 ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-semibold flex-1 ${
                        isSelected ? 'text-white' : 'text-zinc-700'
                      }`}
                    >
                      {cat}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                  </TouchableOpacity>
                )
              }}
            />
            <TouchableOpacity
              onPress={() => setOpen(false)}
              className="bg-orange-500 rounded-2xl h-[52px] items-center justify-center mt-2"
            >
              <Text className="text-white font-bold text-[15px]">Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

// ─── Location Dropdown ───────────────────────────────────────────────────────

const LocationDropdown = ({
  locations,
  selected,
  onSelect,
  onNavigate,
}: {
  locations: { coords: number[]; label: string }[]
  selected: string | null
  onSelect: (label: string) => void
  onNavigate: () => void
}) => {
  const [open, setOpen] = useState(false)
  const isEmpty = locations.length < 1

  const handlePress = () => {
    if (isEmpty) {
      Alert.alert(
        'No locations saved',
        'You need to save a location before setting your store address.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add location', onPress: onNavigate },
        ]
      )
      return
    }
    setOpen(true)
  }

  return (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.75}
        className={`border rounded-2xl h-[52px] flex-row items-center px-4 justify-between ${
          isEmpty ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-100 border-zinc-200'
        }`}
      >
        <View className="flex-row items-center gap-2 flex-1">
          <Ionicons
            name="location-outline"
            size={16}
            color={isEmpty ? '#d4d4d8' : selected ? '#f97316' : '#9ca3af'}
          />
          <Text
            className={`text-[14px] flex-1 ${
              isEmpty ? 'text-zinc-300' : selected ? 'text-zinc-800' : 'text-zinc-400'
            }`}
            numberOfLines={1}
          >
            {isEmpty ? 'No locations saved yet' : selected ?? 'Select a location'}
          </Text>
        </View>
        {isEmpty ? (
          <View className="flex-row items-center gap-1">
            <Text className="text-[11px] text-orange-400 font-semibold">Add first</Text>
            <Ionicons name="arrow-forward" size={13} color="#f97316" />
          </View>
        ) : (
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
        )}
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpen(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[17px] font-bold text-zinc-800">Choose location</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#71717a" />
              </TouchableOpacity>
            </View>
            {locations.map((loc) => {
              const isActive = selected === loc.label
              return (
                <TouchableOpacity
                  key={loc.label}
                  onPress={() => {
                    onSelect(loc.label)
                    setOpen(false)
                  }}
                  className={`flex-row items-center gap-3 p-4 rounded-2xl mb-2 border ${
                    isActive
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-zinc-50 border-zinc-100'
                  }`}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isActive ? 'bg-orange-500' : 'bg-zinc-200'
                    }`}
                  >
                    <Ionicons
                      name="location"
                      size={14}
                      color={isActive ? 'white' : '#71717a'}
                    />
                  </View>
                  <Text
                    className={`flex-1 text-[14px] font-semibold ${
                      isActive ? 'text-orange-600' : 'text-zinc-700'
                    }`}
                    numberOfLines={1}
                  >
                    {loc.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark-circle" size={18} color="#f97316" />}
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity
              onPress={() => {
                setOpen(false)
                onNavigate()
              }}
              className="flex-row items-center gap-2 mt-1 p-3 justify-center"
            >
              <Ionicons name="add-circle-outline" size={16} color="#f97316" />
              <Text className="text-[13px] text-orange-500 font-semibold">Save a new location</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

const CreateStore = () => {
  const router = useRouter()
  const { locations } = useCordsStore()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [storeImageUri, setStoreImageUri] = useState<string | null>(null)
  const [storeImageId, setStoreImageId] = useState<string | null>(null)
  const [open, setOpen] = useState('')
  const [closes, setCloses] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItemDraft[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleStoreImage = async () => {
    const uri = await pickImage()
    if (!uri) return
    setStoreImageUri(uri)
    try {
      const id = await uploadImage(uri)
      setStoreImageId(id)
    } catch {
      Alert.alert('Upload failed', 'Could not upload store image. Please try again.')
    }
  }

  const addMenuItem = () => {
    setMenuItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', price: '', imageUri: null, imageId: null },
    ])
  }

  const updateMenuItem = (id: string, field: keyof MenuItemDraft, value: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const removeMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleMenuItemImage = async (id: string) => {
    const uri = await pickImage()
    if (!uri) return
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, imageUri: uri } : item))
    )
    try {
      const imgId = await uploadImage(uri)
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, imageId: imgId } : item))
      )
    } catch {
      Alert.alert('Upload failed', 'Could not upload menu image.')
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Missing info', 'Please enter your store name.')
    if (!description.trim()) return Alert.alert('Missing info', 'Please add a brand story.')
    if (!open || !closes) return Alert.alert('Missing info', 'Please set opening and closing hours.')
    if (categories.length === 0)
      return Alert.alert('Missing info', 'Select at least one category.')

    setIsSubmitting(true)
    try {
      // You can wire ownerId from your auth store here
      await createVendor({
        name,
        description,
        imageUrl: storeImageId ?? undefined,
        open,
        closes,
        category: categories[0],
        ownerId: 'replace-with-auth-user-id',
      })

      // Create menu items
      for (const item of menuItems) {
        if (item.name && item.price) {
          await createMenuItem('replace-with-new-vendor-id', item.name, Number(item.price), item.imageId ?? '')
        }
      }

      Alert.alert('Store created! 🎉', 'Your store is now live.')
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="px-5 pt-2 pb-4 border-b border-zinc-100">
        <Text className="text-[24px] font-black text-zinc-900 tracking-tight">Open your shop</Text>
        <Text className="text-[13px] text-zinc-400 mt-0.5">Tell customers who you are</Text>
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
                    <Ionicons name="storefront-outline" size={20} color="#f97316" />
                  </View>
                  <Text className="text-[11px] text-zinc-400 font-medium">Store photo</Text>
                </View>
              )}
            </View>
            {/* Edit badge */}
            <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={12} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-[12px] text-zinc-400 mt-3">Tap to upload store photo</Text>
        </View>

        {/* ── Divider ── */}
        <View className="border-t border-zinc-100 mb-5" />

        {/* ── Store Name ── */}
        <View className="mb-5">
          <SectionLabel label="Store Name" />
          <StyledInput
            placeholder="e.g. Mama's Kitchen"
            value={name}
            onChangeText={setName}
            maxLength={60}
          />
          <Text className="text-[11px] text-zinc-400 mt-1.5 text-right">{name.length}/60</Text>
        </View>

        {/* ── Brand Story ── */}
        <View className="mb-5">
          <SectionLabel label="Brand Story" sub="What makes your store special?" />
          <View className="relative">
            <StyledInput
              placeholder="Share your story — what you serve, your vibe, why customers will love you…"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={300}
            />
            <View className="absolute right-3 bottom-3">
              <MaterialIcons name="info-outline" size={15} color="#f97316" />
            </View>
          </View>
          <Text className="text-[11px] text-zinc-400 mt-1.5 text-right">
            {description.length}/300
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
          <SectionLabel label="Categories" sub="Pick what best describes your menu" />
          <CategoryDropdown selected={categories} onSelect={setCategories} />
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
            sub={menuItems.length === 0 ? 'Add items customers can order' : `${menuItems.length} item${menuItems.length > 1 ? 's' : ''} added`}
          />

          {menuItems.length === 0 && (
            <View className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl py-8 items-center mb-3">
              <View className="w-12 h-12 rounded-2xl bg-orange-100 items-center justify-center mb-2">
                <Ionicons name="fast-food-outline" size={22} color="#f97316" />
              </View>
              <Text className="text-[13px] text-zinc-500 font-medium">No menu items yet</Text>
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
            <Text className="text-[14px] font-semibold text-orange-500">Add menu item</Text>
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
  )
}

export default CreateStore