import { View, Text, Image, TextInput } from 'react-native'
import React, { useMemo } from 'react'
import { Order } from '@/types'
import { color } from '@/constants'
import { CustomButton } from '@/components'
import { getPlaceholderCustomer } from './orderHelpers'

// ---- pending order card (unclaimed, offer a delivery fee) -------------

interface RiderOrderCardProps {
  order: Order
  deliveryFee: string
  onChangeFee: (orderId: string, value: string) => void
  expectedTimeDelivery: string
  onChangeExpectedTimeDelivery: (orderId: string, value: string) => void
  onAccept: (order: Order) => void
  accepting: boolean
  offered: boolean
}

const RiderOrderCard = ({
  order,
  deliveryFee,
  onChangeFee,
  expectedTimeDelivery,
  onChangeExpectedTimeDelivery,
  onAccept,
  accepting,
  offered,
}: RiderOrderCardProps) => {
  const customer = useMemo(() => getPlaceholderCustomer(order.customerId), [order.customerId])
  const subtotal = order.subtotal

  return (
    <View
      className='w-full bg-white rounded-[18] border border-zinc-200 p-4 mb-4'
      style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }}
    >
      {/* Customer header */}
      <View className='flex-row items-center gap-3 mb-3'>
        <View
          className='h-9 w-9 rounded-full items-start justify-center'
          style={{ backgroundColor: customer.color }}
        >
          <Text className='text-[11px] uppercase text-start font-[Crispy] text-white'>
            {order.customerName}
          </Text>
        </View>
        <View className='flex-1'>
          <Text className='text-[13px] capitalize font-[Nunito-bold] text-zinc-800'>{order.customerName}</Text>
          <Text className='text-[11px] font-[Nunito-regular] text-zinc-400 mt-0.5'>
            {new Date(order.$createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {new Date(order.$createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Delivery address */}
      <View className='bg-zinc-50 rounded-[10] px-3 py-2 mb-3'>
        <Text className='text-[10px] font-[Nunito-bold] uppercase text-zinc-400'>Deliver to</Text>
        <Text className='text-[12px] font-[nunito-medium] text-zinc-700 mt-0.5'>{JSON.parse(order.userAddress).description}</Text>
      </View>

      {/* Items */}
      <View className='rounded-[12] bg-zinc-50 px-3'>
        {order.items.map((item, idx) => (
          <View
            key={`${order.$id}-${idx}`}
            className={`flex-row items-center gap-3 py-3 ${idx !== order.items.length - 1 ? 'border-b border-zinc-200' : ''}`}
          >
            <Image
              source={{ uri: item.image }}
              className='rounded-[10] h-14 w-14 bg-zinc-200'
              resizeMode='cover'
            />
            <View className='flex-1'>
              <Text className='text-[13px] font-[Nunito-bold] text-zinc-800' numberOfLines={1}>
                {item.name}
              </Text>
              {!!item.vendor?.name && (
                <Text className='text-[11px] font-[Nunito-regular] text-zinc-400 mt-0.5' numberOfLines={1}>
                  {item.vendor.name}
                </Text>
              )}
              <Text className='text-[11px] font-[nunito-medium] text-zinc-500 mt-0.5'>
                Qty {item.quantity}
              </Text>
            </View>
            <Text className='text-[13px] font-[Nunito-bold]' style={{ color: color.moregreen }}>
              ₦{item.price * item.quantity}
            </Text>
          </View>
        ))}
      </View>

      {/* Subtotal */}
      <View className='flex-row justify-between items-center mt-3 pt-3 border-t border-zinc-200'>
        <Text className='text-[13px] font-[Nunito-semiBold] text-zinc-600'>Subtotal</Text>
        <Text className='text-[15px] font-[Nunito-bold]' style={{ color: color.moregreen }}>
          ₦{subtotal}
        </Text>
      </View>

      {/* Delivery fee input */}
      <View className='mt-3'>
        <Text className='text-[11px] font-[Nunito-bold] uppercase text-zinc-400 mb-1'>
          Your delivery price
        </Text>
        <TextInput
          value={deliveryFee}
          onChangeText={(val) => onChangeFee(order.$id, val.replace(/[^0-9]/g, ''))}
          placeholder='Enter amount, e.g. 800'
          placeholderTextColor='#a1a1aa'
          keyboardType='number-pad'
          editable={!offered}
          className='border border-zinc-300 rounded-[10] px-3 py-2 text-[13px] font-[nunito-medium] text-zinc-800'
          style={{ opacity: offered ? 0.6 : 1 }}
        />
      </View>

      {/* Expected delivery time */}
      <View className='mt-3'>
        <Text className='text-[11px] font-[Nunito-bold] uppercase text-zinc-400 mb-1'>
          Expected delivery time (mins)
        </Text>

         <TextInput
          value={expectedTimeDelivery}
          onChangeText={(val) => onChangeExpectedTimeDelivery(order.$id, val.replace(/[^0-9]/g, ''))}
          placeholder='0'
          placeholderTextColor='#a1a1aa'
          keyboardType='number-pad'
          editable={!offered}
          className='border border-zinc-300 rounded-[10] w-20 px-3 py-3 text-[13px] font-[nunito-medium] text-zinc-800'
          style={{ opacity: offered ? 0.6 : 1 }}
        />

      
      </View>

      {/* Accept */}
      <View className='mt-4'>
        <CustomButton
          title={offered ? 'Awaiting customer' : accepting ? 'Accepting…' : 'Accept Order'}
          style={`w-full ${offered ? 'bg-zinc-300' : deliveryFee && expectedTimeDelivery ? 'bg-green-500' : 'bg-zinc-300'}`}
          disabled={!deliveryFee || !expectedTimeDelivery || accepting || offered}
          onPress={() => onAccept(order)}
        />
      </View>
    </View>
  )
}

export default RiderOrderCard