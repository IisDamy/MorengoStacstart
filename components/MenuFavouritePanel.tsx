import { View, Text, ScrollView, Image, TouchableOpacity, Pressable, ActivityIndicator} from 'react-native'
import React, { useEffect } from 'react'
import { getMenuItems } from '@/lib/appwrite'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MenuItemCartAddPopUp from './MenuItemCartAddPopUp'
import { getModifierOptions } from '@/lib/appwrite'
import { formatNaira } from '@/constants/utils'
import {router} from 'expo-router'
import useAppwrite from '@/lib/useAppwrite'
import { useLocalSearchParams } from 'expo-router'
interface MenuFavouritePanelProps {
  seeAll: boolean
}

// Tracks each selected modifier and its quantity


const MenuFavouritePanel = ({ seeAll }: MenuFavouritePanelProps) => {
  const { isFavourite} = useLocalSearchParams<{isFavourite: string}>()
  const {data, loading, refetch, error} = useAppwrite({fn:getMenuItems, params: {isFavourite:'true'}})
  const [menuItems, setMenuItems] = React.useState([])
  const [openItemCartAdd, setOpenItemCartAdd] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState({name:'', price: 0, image:'', vendors:{}, id:null})

 useEffect(() => {       
      if (!data && error) refetch()          
     }, [error]);


  const handleSelectItem =  (item:any) => {
    
    const newVedors = { name: item.vendors.name, $id: item.vendors.$id}
    setSelectedItem({name: item.name, price: item.price, image: item.image, vendors: newVedors, id: item.$id})
    setOpenItemCartAdd(true)
  }


  return (
    <View className='mt-4 mb-3 w-screen pl-5'>    
      {loading? 
      <ActivityIndicator size="small" color="#4386e3" className='my-auto  '/>
        :
      <>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {data?.slice(0, 4).reverse().map((item) =>
          <View
            className='rounded bg-[#F8F8F8] p-2 mx-1 my-2 w-[240] h-[220] rounded-3xl mr-6'
            key={item?.$id}
            style={{
              shadowColor: "#1a1a1a",
              shadowOffset: { width: -5, height: 4 },
              elevation: 2,
              shadowOpacity: 0.25,
            }}
          >
            <TouchableOpacity onPress={() => handleSelectItem(item)}>
              <Image source={{ uri: item.image }} className='w-full h-[130] rounded rounded-3xl' />
            </TouchableOpacity>

            <View className='w-full flex flex-row mb-2 justify-between mt-2'>
              <View className='flex w-fit gap-[0.5] justify-between self-start px-2 flex-col'>
                <TouchableOpacity>
                  <Text className='font-[Nunito-bold] text-md'>{item?.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className='text-sm mt-1 font-[Nunito-bold] text-green-400 w-[120]'
                    onPress={()=> router.push(`/(screens)/SearchPage?vendors=${item.vendors.$id}`)}
                  >{item.vendors?.name}
                  </Text>
                </TouchableOpacity>
                <Text className='text-sm mt-1 text-green-400 font-[Nunito-regular]'>{formatNaira(item.price)}</Text>
              </View>

              <View>
                <View className='flex items-center mt-2'>
                  <Text className='text-xs text-orange-300 text-center font-[Nunito-regular]'>opens / closes:</Text>
                  <Text className='text-xs text-orange-300 font-[Nunito-regular]'>{item.vendors.open} - {item.vendors.closes}</Text>
                  <View className='flex-row items-center mt-1'>
                    <MaterialIcons name='star' color={'gold'} />
                    <Text className='text-sm text-red-300 font-[Nunito-regular]'>{item.vendors.rating} 4.5</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>


      <MenuItemCartAddPopUp 
      visible={openItemCartAdd} 
      onClose={() => setOpenItemCartAdd(false)}
      selectedItem={selectedItem} 
      />
      </>}
    </View>
  )
}

export default MenuFavouritePanel
