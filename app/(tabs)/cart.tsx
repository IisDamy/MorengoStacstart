import { View, Text, Pressable, ScrollView,Image, TouchableOpacity,ActivityIndicator } from 'react-native'
import { createOrder } from '@/lib/appwrite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { color } from '@/constants'
import { useCartStore } from '@/store/cart.auth.store'
import { buildOrderString, formatNaira, nairaToKobo } from '@/constants/utils'
import {TabsHeader} from '@/components'
import useAuthStore from '@/store/auth.store'
import { getUserAddresses } from '@/lib/appwrite'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { watTime } from '@/constants/utils'
import { useCordsStore } from "@/store/coords.store";
import LocationSelectorModal from '@/components/LocationSelectorModal';
import {CustomInput} from '@/components'


const cart = () => {
const { user} = useAuthStore()
  const { items, increaseQty, decreaseQty, getTotalPrice, clearCart} = useCartStore()
  const [loading, setLoading] = useState(false)
  const [defaultAddress, setDefaultAddress] = useState(null)
  const { locations, location } = useCordsStore();
  const [changeLocation, toggleChangeLocation] = useState(false)


  // based on how mny vendora youre ordering from and if they're off or not
  const deliveryPrices = 300

  const itemTotal = getTotalPrice()
  







const checkout = async () => {
  if (loading) return; // 🔥 prevent duplicate calls
  setLoading(true);

  try {
    const res = await createOrder({
      customerId: user?.$id,
      items,
      deliveryFeeKobo:nairaToKobo(300),
      // we'll change delivery fee logic later, i'm think 300 for a vendor, 2-3 vendors 500, off k 1k, subscription is best, we increment costs with platform fee
      platformFeeKobo:nairaToKobo(50),
      subtotalKobo: nairaToKobo(itemTotal),
      // time: watTime,
      userAddress: JSON.stringify({location:location.coords, description:''}),
    });

    console.log(res)
    if (!res) throw new Error('Failed to create order');

    clearCart();
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};


  return (
  
    <SafeAreaView className='px-6 bg-white h-full overflow-visible w-full  flex'>
      <TabsHeader tabName='Cart' />
     
      {/*scrollable flatlist retirning cart items
      **shows scrollbar to let user know it's scrollable
       */}
     {items.length > 0 ? 
     <View className='w-full  items-center' >
      <View className='w-screen '>
          {/* individual item */}
          <ScrollView className=' h-[43%] overflow-hidden  px-6 '
          showsVerticalScrollIndicator={true}
          >
        {items?.map((item, idx) => 
        <View className='w-full  flex-row gap-4 p-1 border-b border-zinc-400 py-5' key={`${item.$id}-${idx}`}>
          {/* img */}
          <Image className='rounded-[10]  h-24 w-24' source={{uri:item.image}}/>
          {/* details */}
          <View className='flex gap-2 w-full '>
            {/* modified */}
            <Text className='text-[14px] w-[230] font-[Nunito-bold]'>{buildOrderString(item, item.modifierOptions)}</Text>
            {/* <Text className='text-[12px] font-bold'>{item.vendor}</Text> */}

              
            <View className='flex-row items-center w-[200] justify-between'>
              <View className='flex-col gap-2'>
                <Text className='font-[Nunito-semiBold] text-[12px]'>{item.vendors.name}</Text>
              {/* Price */}
              <Text className='text-[14px] font-[Nunito-bold] '
                style={{
                  color:color.moregreen
                }}
              >{formatNaira(item.price +  item.modifierOptions?.reduce((sum, item) => sum + (item.price * item.qty|| 0), 0))}
              </Text>
              </View>
              

                {/* changing qty of order */}
              <View className='border rounded-[8] py-2   w-[78] justify-around flex-row'>
                <TouchableOpacity className='h-full w-[35%]' onPress={()=> decreaseQty(item.id, item.modifierOptions)}>
                  <Text className='font-[Nunito-bold] text-center text-red-400 '>-</Text>
                </TouchableOpacity>
                
                <Text className='font-[Nunito-bold]'>{item.quantity}</Text>
                <TouchableOpacity className='w-[35%] h-full' onPress={()=> increaseQty(item.id, item.modifierOptions)}>
                    <Text className='font-[Nunito-bold]  text-green-300 text-center'>+</Text>
                </TouchableOpacity>
                
              </View>
            </View>
          </View>
        </View>) }
        </ScrollView>

        {/* checkout area */}
        {/* change color of border to softer */}
        <View className=' px-6  items-center'>
        <View className='px-6 border-t border-zinc-100 '>
            <View className='flex my-2 gap-1'>
              <View className='flex-row  w-full justify-between'>
                <Text className='text-md font-[Nunito-bold]'>Item Total</Text>
                <Text className='text-md font-[Nunito-bold]'>{itemTotal}</Text>
              </View>
              
              <View className='flex-row justify-between '>
                <Text className='text-md font-[Nunito-regular]'>Discount</Text>
                <Text className='text-md font-[Nunito-regular]'>0</Text>
              </View>
              <View className='flex-row justify-between '>
                <Text className='text-md'>Delivery Fee</Text>
                <Text className='text-md'>500</Text>
              </View>
            </View>
            
            <View className='flex-row mt-2 py-4 border-b border-zinc-300 border-t w-full justify-between'>
              <Text className='text-lg   font-[Nunito-extraBold]'
                style={{
                  color:color.moregreen
                }}
              >TOTAL</Text>
              <Text className='text-lg font-[Nunito-extraBold]'
                style={{
                  color:color.moregreen
                }}
              >
                {formatNaira(getTotalPrice() + deliveryPrices)}
              </Text>
            </View>
        </View>

        {/* change delivery */}
        <View className='my-6 mx-6  justify-between flex-row '>
          <View className='flex-row gap-4'>
                 {/* img of mini map */}
          <View className='h-14 w-14 rounded-[10] bg-zinc-300'></View>

          <View className=''>
            <View className='gap-1 '>
              
                <Text className='font-[Nunito-bold]'
                  
                >Deliver to: {''}
                  <Text style={{color:color.moregreen}}>
                 {location?.label || 'Default Location'}
                </Text>
                </Text>
                {/* below text isnt returned if location isn't saved with name eg home, work, */}             
              <TouchableOpacity>
                  <Text className='text-sm mt-2 font-[Nunito-regular] text-green-400'>Add extra description to location</Text>
              </TouchableOpacity>
              
            </View>
          </View>
          </View>
         
          <TouchableOpacity onPress={()=> toggleChangeLocation(!changeLocation)}>
          <Text className='font-[Nunito-bold] text-green-300'>Change</Text>
          </TouchableOpacity>
        </View>
            <Pressable onPress={checkout} 
        disabled={loading}
        className='mb-32  h-16 rounded-[15] mx-3 w-full '
          style={{
            backgroundColor:color.moregreen
          }}
        >
          <View className='flex-row items-center justify-around h-full  w-full'>
            <Text className='text-white font-[Nunito-bold] border-r pr-5 border-white'>Checkout</Text>
            <Text className='text-white font-[Nunito-bold]'>{formatNaira(400)}</Text>
          </View>
  
        </Pressable>
      </View>
      </View>

        <LocationSelectorModal
          // visible={changeLocation}
          open={changeLocation}
          onClose={() => toggleChangeLocation(false)}
          onNavigate={() => router.push('/(tabs)/location')}
          locations={locations}
        />

         </View>: 

            <Text className='self-center my-auto font-[Crispy] tracking-tighter text-lg  text-green-500 rotate-[-10deg] bg-white '>YOUR CART IS EMPTY</Text>

         }
     
      
    </SafeAreaView>
  )
}

export default cart 