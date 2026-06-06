// components/MenuVendorPanel.tsx
import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { color } from '@/constants'
import { convertTo12Hour } from '@/constants/utils'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

const MenuVendorPanel = ({ data}: { data: any, key: number}) => {
  const exclude = ['popular', 'local', 'favourite', 'recent']
  const isFavourite = data.category.includes('favourite')
  const displayTags = data.category.filter((n: string) => !exclude.includes(n))

  const ratingDots = Array.from({ length: 5 }, (_, i) => i < Math.round(data.rating))

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => router.push(`/(screens)/SearchPage?vendors=${data.$id}`)}
    >
      <View className="flex-row rounded-[15px] overflow-hidden h-[150px]"
        style={{ backgroundColor: '#F8F8F8', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' }}
      >
        {/* Thumbnail */}
        <View className="w-[110px] h-full relative">
          <Image
            source={{ uri: data.imageUrl }}
            className="absolute w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            className="absolute inset-0"
          />
          <Text
            className="absolute top-[50%] left-0 right-0 text-center text-[13px] uppercase px-2"
            style={{ color: color.morange, fontFamily: 'Crispy', letterSpacing: 1.2 }}
            numberOfLines={2}
          >
            {data.name}
          </Text>
        </View>

        {/* Body */}
        <View className="flex-1 px-3 py-3 justify-between  overflow-hidden">
          <View className="gap-[10px]">
            {/* Name */}
            <Text className="text-[15px] font-[Nunito-medium]" numberOfLines={1}>
              {data.name}
            </Text>

            {/* Category tags */}
            <View className="flex-row flex-wrap gap-[5px]">
              {displayTags.slice(0, 3).map((tag: string, index: number) => (
                <View
                  key={index}
                  className="rounded-full px-2 py-[2px]"
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                >
                  <Text className="text-[8px] uppercase font-[Nunito-medium] text-gray-500" style={{ letterSpacing: 0.5 }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <Text className="text-[12px] font-[Nunito-regular] text-gray-400 leading-[1.4]" numberOfLines={2}>
              {data.description}
            </Text>
          </View>

          {/* Footer: rating + hours */}
          <View className="flex-row items-center justify-between">
            {/* Round dot rating */}
            <View className="flex-row items-center gap-[5px]">
              <View className="flex-row gap-[3px]">
                {ratingDots.map((filled, i) => (
                  <View
                    key={i}
                    className="w-[8px] h-[8px] rounded-full"
                    style={{ backgroundColor: filled ? '#f9a825' : '#ddd' }}
                  />
                ))}
              </View>
              <Text className="text-[12px] font-[Nunito-medium]">{data.rating}</Text>
            </View>

            {/* Hours */}
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={12} color="#e05050" />
              <Text className="text-[11px] font-[Nunito-medium] text-red-400">
                {convertTo12Hour(data.open)} – {convertTo12Hour(data.closes)}
              </Text>
            </View>
          </View>
        </View>

        {/* Favourite button */}
        <TouchableOpacity
          className="absolute top-[8px] right-[10px] w-[28px] h-[28px] rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <Ionicons
            name={isFavourite ? 'heart' : 'heart-outline'}
            size={14}
            color={isFavourite ? '#e05050' : color.morange}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export default MenuVendorPanel