import { View, Text, ScrollView, TouchableOpacity, Pressable, ImageBackground } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { router } from 'expo-router'
import { color } from '@/constants'

type SubMenuPanelProps = {
  // menu items fetched by the parent, so this panel never fetches on its own
  data?: any[]
  // called when a tile is pressed; the parent owns the add-to-cart popup
  onSelectItem: (item: any) => void
  title?: string
  limit?: number
}

const SubMenuPanel = ({ data, onSelectItem, title = 'Recent', limit = 4 }: SubMenuPanelProps) => {
  if (!data || data.length === 0) return null

  return (
    <View className='mb-3 w-screen'>
      <View className='flex-row w-full px-6 mb-4 self-center justify-between'>
        <Text className='font-[Nunito-Medium] tracking-wider'>{title}</Text>

        <TouchableOpacity
          onPress={() => router.push('/(screens)/SearchPage')}
          className='flex-row items-center'
        >
          <Text className='text-green-400 font-[Nunito-Medium] tracking-wider text-sm'>See all</Text>
          <MaterialIcons name='keyboard-arrow-right' color={'#4ade80'} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className='pl-5'>
        {data.slice(0, limit).reverse().map((item) => (
          <View
            key={item?.$id}
            className='bg-orange-50 p-1 my-1 w-[100] h-[120] overflow-hidden rounded-2xl mr-6'
            style={{
              shadowColor: '#1a1a1a',
              shadowOffset: { width: -5, height: 4 },
              elevation: 2,
              shadowOpacity: 0.25,
            }}
          >
            <Pressable onPress={() => onSelectItem(item)} className='flex-1 rounded-2xl overflow-hidden'>
              <ImageBackground source={{ uri: item.image }} className='flex-1 rounded-2xl'>
                <LinearGradient
                  colors={['rgba(0,0,0,0.05)', 'rgba(8, 8, 8, 0.45)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </ImageBackground>
            </Pressable>

            <View className='z-4'>
              <Text
                numberOfLines={1}
                className='text-[11px] tracking-wider capitalize mx-auto pb-1'
                style={{ color: color.moregreen }}
              >
                {item?.name}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default SubMenuPanel