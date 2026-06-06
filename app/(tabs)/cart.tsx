import { View, Text, Pressable, ScrollView,Image, TouchableOpacity,ActivityIndicator } from 'react-native'
import { createOrder } from '@/lib/appwrite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { color } from '@/constants'
import { useCartStore } from '@/store/cart.auth.store'
import { buildOrderString, formatNaira } from '@/constants/utils'
import {TabsHeader} from '@/components'
// if cart is empty return empty cart display, just a picture of a cart, or some cute animation,or image and buttom bellow with + add items
import useAuthStore from '@/store/auth.store'
import { getUserAddresses } from '@/lib/appwrite'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { watTime } from '@/constants/utils'


const cart = () => {
const { user} = useAuthStore()
  const { items, increaseQty, decreaseQty, getTotalPrice, clearCart} = useCartStore()
  const [loading, setLoading] = useState(false)
  const [defaultAddress, setDefaultAddress] = useState(null)


  const itemTotal = getTotalPrice()
  
const totaal = itemTotal + 500



useEffect(() => {

  getDefaultAddress();
}, []);

  const getDefaultAddress = async () => {
      const addresses = await getUserAddresses(user?.accountId);
      const res = addresses.find(addr => addr.isDefault);
      setDefaultAddress(res);
  };


const checkout = async () => {
  if (loading) return; // 🔥 prevent duplicate calls
  setLoading(true);

  try {
    const res = await createOrder({
      customerId: user?.$id,
      items,
      totalAmount: totaal,
      time: watTime,
      userAddress: defaultAddress?.id || '',
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
  
    <SafeAreaView className='px-6 bg-white h-full w-full  flex'>
      
      <TabsHeader tabName='Cart' />
     
      {/*scrollable flatlist retirning cart items
      **shows scrollbar to let user know it's scrollable
       */}
     {items.length > 0 ? 
     <View className='w-full  items-center' >
      <View className='w-full'>
          {/* individual item */}
          <ScrollView className=' h-[44%] overflow-hidden  '>
        {items?.map((item, idx) => 
        <View className='w-full  flex-row gap-4 p-1  mt-10' key={`${item.$id}-${idx}`}>
          {/* img */}
          <Image className='rounded-[10]  h-24 w-24' source={{uri:item.image}}/>
          {/* details */}
          <View className='flex gap-2 '>
            {/* modified */}
            <Text className='text-[14px] w-[230] font-[Nunito-bold]'>{buildOrderString(item, item.modifierOptions)}</Text>
            {/* <Text className='text-[12px] font-bold'>{item.vendor}</Text> */}

              
            <View className='flex-row items-center w-[200] justify-between'>
              <View className='flex-col gap-2'>
                <Text className='font-[Nunito-regular]'>{item.name}</Text>
              {/* Price */}
              <Text className='text-[15px] font-[Nunito-bold] '
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
        <View className='  border-t border-zinc-300'>
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
                {formatNaira(totaal)}
              </Text>
            </View>
        </View>

        {/* change delivery */}
        <View className='my-6 justify-between flex-row '>
          <View className='flex-row gap-4'>
                 {/* img of mini map */}
          <View className='h-20 w-20 rounded-[10] bg-zinc-300'></View>

          <View className=''>
            <View className='gap-1 '>
              
                <Text className='font-[Nunito-bold]'>Deliver to: {defaultAddress?.name || 'Default Location'}</Text>
                {/* below text isnt returned if location isn't saved with name eg home, work, */}
               
             
              
              <Text className='text-sm mt-2 font-[Nunito-regular]'>Google maps location text</Text>
            </View>
          </View>
          </View>
         

          <Text className='font-[Nunito-bold] text-green-300'>Change</Text>
        </View>
      </View>

        <Pressable onPress={checkout} 
        disabled={loading}
        className='mb-12 mt-2 h-16 rounded-[15] mx-3 w-full '
          style={{
            backgroundColor:color.moregreen
          }}
        >
          <View className='flex-row items-center justify-around h-full  w-full'>
            <Text className='text-white font-[Nunito-bold] border-r pr-5 border-white'>Checkout</Text>
            <Text className='text-white font-[Nunito-bold]'>{formatNaira(totaal)}</Text>
          </View>
  
        </Pressable>

         </View>: 

            <Text className='self-center my-auto font-[Crispy] tracking-tighter text-lg  text-green-500 rotate-[-10deg] bg-white '>YOUR CART IS EMPTY</Text>

         }
     
      
    </SafeAreaView>
  )
}

export default cart 