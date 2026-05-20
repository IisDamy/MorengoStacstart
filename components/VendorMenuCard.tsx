// components/VendorMenuCard.tsx
import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface VendorMenuCardProps {
  item: {
    $id: string
    name: string
    price: number
    image: string
    vendors: {
      $id: string
      name: string
    }
  }
  onPress: (item: any) => void
}

const VendorMenuCard = ({ item, onPress }: VendorMenuCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.85}
      className="w-[150px] h-[150px] rounded-2xl overflow-hidden"
      style={{ borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Background image */}
      <Image
        source={{ uri: item.image }}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      {/* Gradient overlay — dark at bottom */}
      <View
        className="absolute inset-0"
        style={{
          background: undefined,
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
        }}
        // Use expo-linear-gradient for a real gradient:
        // <LinearGradient colors={['transparent','rgba(0,0,0,0.75)']} ... />
        // Fallback solid tint:
      />
      <View className="absolute inset-0 bg-black/30" />
      <View
        className="absolute bottom-0 left-0 right-0 h-[70%] bg-transparent"
        style={{
          backgroundColor: 'transparent',
          shadowColor: '#000',
        }}
      />

      {/* Price tag — top right */}
      <View
        className="absolute top-2 right-2 rounded-full px-2 py-[3px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      >
        <Text className="text-white text-[11px] font-semibold">
          ₦{item.price.toLocaleString()}
        </Text>
      </View>

      {/* Bottom info */}
      <View className="absolute bottom-2 left-0 right-0 items-center px-2 gap-[3px]">
        {/* Vendor badge */}
        <View
          className="flex-row items-center gap-1 rounded-full px-2 py-[2px]"
          style={{
            backgroundColor: 'rgba(255,255,255,0.13)',
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.25)',
          }}
        >
          <Ionicons name="storefront-outline" size={10} color="#a8f5c8" />
          <Text
            className="text-[10px] font-medium"
            style={{ color: '#a8f5c8' }}
            numberOfLines={1}
          >
            {item.vendors.name}
          </Text>
        </View>

        {/* Item name */}
        <Text
          className="text-white text-[13px] font-semibold text-center"
          numberOfLines={2}
          style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width:0,height:1}, textShadowRadius: 3 }}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default VendorMenuCard