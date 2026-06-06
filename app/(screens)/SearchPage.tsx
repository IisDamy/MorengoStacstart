import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SearchBar } from '@/components'
import Filter from '@/components/Filter'
import { getMenuItems, getVendors } from '@/lib/appwrite'
import { useAppwrite } from '@/lib/useAppwrite'
import MenuVendorPanel from '@/components/MenuVendorPanel'
import MenuItemCartAddPopUp from '@/components/MenuItemCartAddPopUp'

const SearchPage = () => {
  const { category, query, vendors } = useLocalSearchParams<{ query: string; category: string; vendors: string }>()

  const { data, refetch, loading } = useAppwrite({ fn: getMenuItems, params: { query, vendors } })

  const {
    data: dataVendors,
    refetch: refetchVendors,
    loading: loadingVendors,
    handleDataFilter,
  } = useAppwrite({ fn: getVendors, params: {} })

  const [openItemCartAdd, setOpenItemCartAdd] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState({ name: '', price: 0, image: '', vendors: {}, id: null })
  const [openFilter, setOpenFilter] = React.useState(false)

  const handleSelectItem = (item: any) => {
    const newVendors = { name: item.vendors.name, $id: item.vendors.$id }
    setSelectedItem({ name: item.name, price: item.price, image: item.image, vendors: newVendors, id: item.$id })
    setOpenItemCartAdd(true)
  }

  useEffect(() => {
    refetch({ query, vendors })
  }, [query, category])

  useEffect(() => {
    refetchVendors({})
  }, [vendors])

  useEffect(() => {
    if (!category) return
    // null predicate = restore full list; otherwise filter from the original fetch result
    handleDataFilter(
      category === 'All'
        ? null
        : (vendor: any) => vendor.category?.includes(category.toLowerCase())
    )
  }, [category])

  return (
    <SafeAreaView className='h-full'>
      <Filter open={openFilter} onClose={() => setOpenFilter(false)} />

      {loading || loadingVendors ? (
        <ActivityIndicator size="large" color="#f59e0b" className='my-auto' />
      ) : (
        <FlatList
          data={query || vendors ? data : dataVendors}
          key={query || vendors ? "grid" : "list"}
          keyExtractor={(item) => item.$id}
          columnWrapperClassName={query || vendors ? "gap-4" : undefined}
          numColumns={query || vendors ? 2 : 1}
          contentContainerClassName="gap-6 px-5 p-4"
          renderItem={({ item, index }) => {
            if (query || vendors) {
              return (
                <TouchableOpacity onPress={() => handleSelectItem(item)}>
                  <View
                    id={`${item.$id}`}
                    className='bg-[#F8F8F8] overflow-hidden rounded-2xl w-[150] h-[150]'
                    key={index}
                  >
                    <Image source={{ uri: item.image }} className='w-full h-full absolute' resizeMode='cover' />
                    <View className='absolute items-center bottom-[25]'>
                      <Text className='font-bold text-green-600 text-shadow-lg'>{item.vendors.name}</Text>
                      <Text className='text-center' style={{ fontFamily: 'Crispy' }}>{item.name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }
            return <MenuVendorPanel data={item} key={index} />
          }}
          ListHeaderComponent={() => (
            <View className='flex-row w-full z-4 justify-between items-center mb-4'>
              <SearchBar handleOpenFilter={() => setOpenFilter(!openFilter)} />
              <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                <Text className='ml-2 text-md font-bold text-yellow-300'>Exit</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <MenuItemCartAddPopUp
        visible={openItemCartAdd}
        onClose={() => setOpenItemCartAdd(false)}
        selectedItem={selectedItem}
      />
    </SafeAreaView>
  )
}

export default SearchPage