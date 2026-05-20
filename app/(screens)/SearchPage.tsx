import { View, Text, FlatList, TouchableOpacity,Image, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import React,{useEffect} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SearchBar } from '@/components'
import Filter from '@/components/Filter'
import {MenuItem} from "@/types";
import { getMenuItems, getVendors } from '@/lib/appwrite';
import { useAppwrite } from '@/lib/useAppwrite';
import MenuVendorPanel from '@/components/MenuVendorPanel'
import VendorMenuCard from '@/components/VendorMenuCard'
import MenuItemCartAddPopUp from '@/components/MenuItemCartAddPopUp'


// add another query so veendors are only rendered when routed from see more, else return hisory, and clear or customizations or common searchs
const SearchPage = () => {
  const { category, query, vendors } = useLocalSearchParams<{query: string; category: string, vendors:string}>()
  const { data, refetch, loading } = useAppwrite({ fn: getMenuItems, params: { query, vendors} });
    const { data:dataVendors, refetch:refetchVendors, loading:loadingVendors } = useAppwrite({ fn: getVendors, params: { } });
  const [openItemCartAdd, setOpenItemCartAdd] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState({name:'', price: 0, image:'', vendors:{}, id:null})



  const handleSelectItem =  (item:any) => {
  
    const newVedors = { name: item.vendors.name, $id: item.vendors.$id}
    setSelectedItem({name: item.name, price: item.price, image: item.image, vendors: newVedors, id: item.$id,})
    setOpenItemCartAdd(true)
  }


useEffect(() => {
        
        refetch({ query, vendors})
       
        
    }, [category, query]);


    useEffect(()=> {
       refetchVendors({})
    },[vendors])




  return (
    <SafeAreaView className='h-full '>
      {/* <Filter /> */}
       {loading || loadingVendors?
        <ActivityIndicator size="large" color="#4386e3" className='my-auto'/>:
        <FlatList
            data={query || vendors ? data : dataVendors}
            key={query || vendors ? "grid" : "list"} 
            keyExtractor={(item) => item.$id}
            columnWrapperClassName={query || vendors ?"gap-4":undefined}
            numColumns={query || vendors ? 2 : 1}
            contentContainerClassName="gap-6  px-5 p-4 "
            renderItem={({item, index}) => {
              if (query || vendors) {
                return (
                  // vendor cards
                <TouchableOpacity onPress={() => handleSelectItem(item)}>
                <View id={`${item.$id}`} className='bg-[#F8F8F8] overflow-hidden rounded rounded-2xl w-[150] h-[150] '
                          key={index}
                          >
                          <Image source={{uri: item.image}} className='w-full h-full absolute' resizeMode='cover'/>
                          <View className='absolute items-center bottom-[25]'> 
                          <Text className='font-bold text-green-600 text-shdaow-black text-shadow-lg'>{item.vendors.name}</Text>                                                  
                          <Text className='text-center  '
                          style={{
                            fontFamily:'Crispy',}}>
                            {item.name}
                          </Text>
                          
                          </View>

                  </View>
                </TouchableOpacity>
                         )
              }
              else {
                return (
                 <MenuVendorPanel data={item} key={index}/>
              )
              }
            }}
            ListHeaderComponent={ () => (
            <View className='flex-row w-full z-4  justify-between items-center  mb-4'>
        <SearchBar />
        <TouchableOpacity onPress={()=> router.push('/(tabs)')}>
                <Text className='ml-2 text-md font-bold text-yellow-300'>Exit</Text>
        </TouchableOpacity>
        
    </View>
            )}
        />}
    <MenuItemCartAddPopUp visible={openItemCartAdd} onClose={()=> {setOpenItemCartAdd(false)}} selectedItem={selectedItem}/>
    </SafeAreaView>
   
  )
}

export default SearchPage