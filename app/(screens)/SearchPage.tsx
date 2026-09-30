import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
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

  const isSearch = !!(query || vendors)
  const list: any[] = (isSearch ? data : dataVendors) || []

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

  // Title above the results
  const title = query
    ? `Results for “${query}”`
    : vendors
      ? 'Menu items'
      : category && category !== 'All'
        ? category
        : 'All vendors'
  const countLabel = `${list.length} ${isSearch ? (list.length === 1 ? 'item' : 'items') : list.length === 1 ? 'vendor' : 'vendors'}`

  // Element (not an inline component) so the SearchBar isn't remounted on every render
  const resultsHeader = (
    <View className='mb-2'>
      <Text className='text-xl text-gray-900' style={{ fontFamily: 'Crispy' }} numberOfLines={1}>
        {title}
      </Text>
      {!loading && !loadingVendors && <Text className='text-gray-500 mt-1'>{countLabel}</Text>}
    </View>
  )

  const renderEmpty = () => (
    <View className='items-center mt-20 px-8'>
      <View className='w-16 h-16 rounded-full items-center justify-center mb-4' style={{ backgroundColor: 'rgba(87,168,134,0.15)' }}>
        <Ionicons name='search-outline' size={28} color='#57a886' />
      </View>
      <Text className='text-lg text-gray-900' style={{ fontFamily: 'Crispy' }}>Nothing found</Text>
      <Text className='text-center text-gray-500 mt-1'>Try a different search or change your filters.</Text>
    </View>
  )

  return (
    <SafeAreaView className='h-full bg-orange-50'>
      <Filter open={openFilter} onClose={() => setOpenFilter(false)} />

      {/* Fixed search row */}
      <View className='flex-row items-center  px-5 pt-2 pb-3' style={{ gap: 10 }}>
        <View className='flex-1'>
          <SearchBar handleOpenFilter={() => setOpenFilter(!openFilter)} />
        </View>
        <TouchableOpacity
          accessibilityRole='button'
          accessibilityLabel='Exit search'
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)')}
          className='w-11 h-11 rounded-full items-center justify-center'
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
        >
          <Ionicons name='close' size={22} color='#374151' />
        </TouchableOpacity>
      </View>

      {loading || loadingVendors ? (
        <ActivityIndicator size='large' color='#f59e0b' className='my-auto' />
      ) : (
        <FlatList
          data={list}
          key={isSearch ? 'grid' : 'list'}
          keyExtractor={(item) => item.$id}
          numColumns={isSearch ? 2 : 1}
          columnWrapperStyle={isSearch ? { justifyContent: 'space-between' } : undefined}
          contentContainerClassName='gap-4 px-5 pb-10'
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={resultsHeader}
          ListEmptyComponent={renderEmpty}
          renderItem={({ item }) => {
            if (isSearch) {
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleSelectItem(item)}
                  className='rounded-2xl overflow-hidden bg-[#F8F8F8]'
                  style={{ width: '48%', aspectRatio: 1 }}
                >
                  <Image source={{ uri: item.image }} className='w-full h-full absolute' resizeMode='cover' />

                  {/* dark fade so the text is always readable */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.78)']}
                    style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%' }}
                  />

                  {/* price */}
                  <View
                    className='absolute top-2 left-2 px-2 py-1 rounded-full'
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                  >
                    <Text className='text-white text-xs font-bold'>₦{Number(item.price).toLocaleString()}</Text>
                  </View>

                  {/* name + vendor + add button */}
                  <View className='absolute left-3 right-3 bottom-3 flex-row items-end justify-between'>
                    <View className='flex-1 mr-2'>
                      <Text className='text-xs font-bold' style={{ color: '#86efac' }} numberOfLines={1}>
                        {item.vendors.name}
                      </Text>
                      <Text className='text-white text-base' style={{ fontFamily: 'Crispy' }} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>
                    <View className='w-8 h-8 rounded-full bg-orange-500 items-center justify-center'>
                      <Ionicons name='add' size={20} color='white' />
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }
            return <MenuVendorPanel data={item} />
          }}
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