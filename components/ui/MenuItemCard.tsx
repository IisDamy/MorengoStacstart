import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { MenuItemDraft } from '@/types'




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
            <Text className="text-[10px] font-[Nunito-regular] text-zinc-400 mt-1">Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View className="flex-1 gap-2">
        <TextInput
          className="bg-zinc-100 border font-[Nunito-regular] border-zinc-200 rounded-xl px-3 h-[44px] text-[13px] text-zinc-800"
          placeholder="Item name"
          placeholderTextColor="#9ca3af"
          value={item.name}
          onChangeText={(t) => onUpdate(item.id, 'name', t)}
        />
        <View className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 h-[44px] flex-row items-center">
          <Text className="text-orange-500 font-[Nunito-bold] text-[14px] mr-1">₦</Text>
          <TextInput
            className="flex-1 text-[13px] font-[Nunito-regular] text-zinc-800"
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

export default MenuItemCard