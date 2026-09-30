import { View, Text, ScrollView, TouchableOpacity, Pressable, ActivityIndicator, ImageBackground } from 'react-native'
import React, { useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { getMenuItems } from '@/lib/appwrite'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MenuItemCartAddPopUp from './MenuItemCartAddPopUp'
import SubMenuPanel from './ui/SubMenuPanel' // <-- adjust the path to wherever SubMenuPanel lives
import { formatNaira } from '@/constants/utils'
import { router } from 'expo-router'
import useAppwrite from '@/lib/useAppwrite'

const MenuFavouritePanel = () => {
  const { data, loading, refetch, error } = useAppwrite({ fn: getMenuItems, params: { isFavourite: 'true' } })
  const [openItemCartAdd, setOpenItemCartAdd] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState({ name: '', price: 0, image: '', vendors: {}, id: null })

  useEffect(() => {
    if (!data && error) refetch()
  }, [error])

  const handleSelectItem = (item: any) => {
    const newVendors = { name: item.vendors.name, $id: item.vendors.$id }
    setSelectedItem({ name: item.name, price: item.price, image: item.image, vendors: newVendors, id: item.$id })
    setOpenItemCartAdd(true)
  }

  return (
    <View className='mb-3 w-screen'>
      <SubMenuPanel data={data} onSelectItem={handleSelectItem} title='Recent' />

      <View className='flex-row w-full px-6 mb-4 self-center justify-between'>
        <Text className='font-[Nunito-Medium] tracking-wider'>Favourite</Text>

        <TouchableOpacity
          onPress={() => router.push('/(screens)/SearchPage')}
          className='flex-row items-center'
        >
          <Text className='text-green-400 font-[Nunito-Medium] tracking-wider text-sm'>See all</Text>
          <MaterialIcons name='keyboard-arrow-right' color={'#4ade80'} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size='small' color='#4386e3' className='my-auto' />
      ) : (
        <>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className='pl-5'>
            {data?.slice(0, 4).reverse().map((item: any) => (
              <View
                className='bg-[#F8F8F8] mx-1 my-2 w-[210] h-[140] overflow-hidden rounded-3xl mr-6'
                key={item?.$id}
                style={{
                  shadowColor: '#1a1a1a',
                  shadowOffset: { width: -5, height: 4 },
                  elevation: 2,
                  shadowOpacity: 0.25,
                }}
              >
                <Pressable onPress={() => handleSelectItem(item)}>
                  <ImageBackground source={{ uri: item.image }} className='w-[210] h-[140] absolute top-0'>
                    <LinearGradient
                      colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.75)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  </ImageBackground>
                </Pressable>

                <View className='w-full flex flex-row my-auto mb-2 bg-transparent justify-between'>
                  <View className='flex w-fit gap-[0.5] bg-transparent justify-between px-2 flex-col'>
                    <TouchableOpacity>
                      <Text className='font-[Nunito-bold] text-white text-md'>{item?.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text
                        className='text-sm mt-1 font-[Nunito-bold] text-green-400 w-[120]'
                        onPress={() => router.push(`/(screens)/SearchPage?vendors=${item.vendors.$id}`)}
                      >
                        {item.vendors?.name}
                      </Text>
                    </TouchableOpacity>
                    <Text className='text-sm mt-1 text-green-400 font-[Nunito-regular]'>{formatNaira(item.price)}</Text>
                  </View>

                  <View>
                    <View className='flex items-center mx-1 mt-2'>
                      <Text className='text-xs text-orange-500 text-center font-[Nunito-regular]'>open / closes</Text>
                      <Text className='text-xs text-orange-300 font-[Nunito-regular]'>
                        {item.vendors.open}am - {item.vendors.closes}pm
                      </Text>
                      <View className='flex-row items-center mt-1'>
                        <MaterialIcons name='star' size={8} color={'gold'} />
                        <Text className='text-xs text-red-400 font-[Nunito-regular]'>{item.vendors.rating}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Reuses the data above: no second fetch, and it shares the same popup */}
          

          <MenuItemCartAddPopUp
            visible={openItemCartAdd}
            onClose={() => setOpenItemCartAdd(false)}
            selectedItem={selectedItem}
          />
        </>
      )}
    </View>
  )
}

export default MenuFavouritePanel