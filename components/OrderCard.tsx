import { View, Text, Pressable, Image } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { color, images } from '@/constants'
import { CustomButton } from '@/components'
import { Order, User, DeliveryOpts } from '@/types'
import StatusPill from './StatusPill'
import { getDisputeTimeLeft } from '@/lib/utils'
import { Alert } from 'react-native'
import useNotificationStore from '@/store/notification.store'



interface OrderCardProps {
  order: Order
  user: User | null
  onCancel: (orderId: string) => void
  payoutInfo: {status:string, failureReason:string, orderId:string}
  onPay: (order: Order) => void
  onDispute: (order: Order) => void
  canPay?: boolean
  canCancel?: boolean
  canDispute?: boolean
  deliveryOffers?: DeliveryOpts[]
  onSelectRider?: (order: Order, offer: DeliveryOpts) => void
}

const OrderCard = ({
  order,
  user,
  onCancel,
  onPay,
  onDispute,
  canPay = false,
  canCancel = false,
  canDispute = false,
  payoutInfo,
  deliveryOffers = [],
  onSelectRider,
}: OrderCardProps) => {
  const [disputeTimeLeft, setDisputeTimeLeft] = useState(() => (canDispute ? getDisputeTimeLeft(order) : 0))
  const [isPaid, setIsPaid] = useState(false)
  const {addMsg, msgs} = useNotificationStore()

  useEffect(() => {
    if (!canDispute) return
    setDisputeTimeLeft(getDisputeTimeLeft(order))
    const interval = setInterval(() => setDisputeTimeLeft(getDisputeTimeLeft(order)), 1000)
    return () => clearInterval(interval)
  }, [canDispute, order.$updatedAt])

  const disputeExpired = disputeTimeLeft <= 0

  // this card only cares about offers for its own order
  const myDeliveryOffers = useMemo(
    () => deliveryOffers.filter((offer) => offer.orderId === order.$id),
    [deliveryOffers, order.$id]
  )

  useEffect(()=>{
    if (payoutInfo){
      if (payoutInfo.orderId !== order.$id ) return

     if (payoutInfo.status === 'failed' ) {
        Alert.alert(payoutInfo.failureReason)
          addMsg({Text:payoutInfo.failureReason, type:'failure'})
        setIsPaid(false)
        return
      }

        if (payoutInfo.status === 'reversed' ) {
        Alert.alert('Trasaction has been reversed')
          addMsg({Text:'Transaction reversed', type:'failure'})
        setIsPaid(false)
        return
      }

     
      Alert.alert(payoutInfo.status)
      addMsg({Text:`Order ${payoutInfo.status}`, type:'success'})
    }
      

  },[
    payoutInfo
  ])



  return (
    <View
      className='w-full bg-white rounded-[18] border border-zinc-200 p-4 mb-4'
      style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }}
    >
      {/* Header: customer name, time, live status */}
      <View className='flex-row justify-between items-start mb-3'>
        <View>
          <Text className='text-[13px] font-[Nunito-bold] text-zinc-800'>{user?.name}</Text>
          <Text className='text-[11px] font-[Nunito-regular] text-zinc-400 mt-0.5'>
            {new Date(order.$createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {new Date(order.$createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <StatusPill status={order.status} />
      </View>

      
    

      {order.riderId && (
        <View className='flex-row items-center mb-3'>
          <Text className='text-[11px] font-[Nunito-medium] text-zinc-500'>Expected Rider: </Text>
          <Image className='w-4 h-4' source={images.check} />
          <Text className='capitalize text-zinc-500 text-[11px] font-[Nunito-bold]'> {order.riderName}</Text>
        </View>

      )}
        {/* Delivery address */}
        <View className='py-6 pl-2  border-zinc-200 bg-zinc-50 justify-center mr-4 rounded-[10] mb-3'>
              <Text className='text-[12px] font-[Nunito-medium]  text-zinc-500 '>
        Delivering to {JSON.parse(order.userAddress)?.description || 'N/A'}
      </Text>

        </View>
      
      {/* Items */}
      <View className='rounded-[12] bg-zinc-50 px-3'>
        {order.items.map((item, idx) => (
          <View
            key={`${order.$id}-${idx}`}
            className={`flex-row items-center gap-3 py-3 ${idx !== order.items.length - 1 ? 'border-b border-zinc-200' : ''}`}
          >
            <Image source={{ uri: item.image }} className='rounded-[10] h-14 w-14 bg-zinc-200' resizeMode='cover' />
            <View className='flex-1'>
              <Text className='text-[13px] font-[Nunito-bold] text-zinc-800' numberOfLines={1}>
                {item.name}
              </Text>
              {!!item.vendor?.name && (
                <Text className='text-[11px] font-[Nunito-regular] text-zinc-400 mt-0.5' numberOfLines={1}>
                  {item.vendor.name}
                </Text>
              )}
              <Text className='text-[11px] font-[Nunito-medium] text-zinc-500 mt-0.5'>Qty {item.quantity}</Text>
            </View>
            <Text className='text-[13px] font-[Nunito-bold]' style={{ color: color.moregreen }}>
              ₦{item.price * item.quantity}
            </Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View className='flex-row justify-between items-center mt-3 pt-3 border-t border-zinc-200'>
        <Text className='text-[13px] font-[Nunito-semiBold] text-zinc-600'>Order Total</Text>
        <Text className='text-[16px] font-[Nunito-bold]' style={{ color: color.moregreen }}>
          ₦{order.total}
        </Text>
      </View>

      {/* Rider offers — pending orders only, waiting for the customer to pick one */}
      {order.status === 'pending' && myDeliveryOffers.length > 0 && (
        <View className='mt-3 pt-3 border-t border-zinc-200'>
          <Text className='text-[11px] py-2 font-[Nunito-bold] uppercase text-zinc-400 mb-2'>
            Select rider and delivery fee
          </Text>
          {myDeliveryOffers.map((offer) => (
            <Pressable
              key={offer.$id}
              onPress={() => onSelectRider?.(order, offer)}
              className='flex-row justify-between items-center mx-4 bg-zinc-50 rounded-[10] px-3 py-3 mb-2 border border-zinc-200'
            >
              <Text className='text-[10px] uppercase font-[Nunito-bold] text-zinc-800'>{offer.riderName}</Text>
              <Text className='text-[10px] uppercase font-[Nunito-bold] text-zinc-400'>{offer.expectedTimeDelivery} mins</Text>
              <Text className='text-[12px] font-[Nunito-bold]' style={{ color: color.moregreen }}>
                ₦{offer.deliveryFee}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Actions */}
      {(canPay || canCancel || canDispute) && (
        <View className='flex-row gap-3 mt-4'>
          {canPay && (
            <View className='flex-1'>
              <CustomButton textStyle='text-[12px]' title='Make Payment' disabled={isPaid}  style='bg-green-500 w-full'  onPress={() => {
                onPay(order)
                setIsPaid(true)
                }} />
            </View>
          )}
          {canDispute && !disputeExpired && (
            <View className='flex-1'>
              <Image source={images.clock} className='w-4 mb-4 h-4' resizeMode='contain' />
              <CustomButton textStyle='text-[12px]' title='Raise Dispute' style='bg-orange-500 w-full' onPress={() => onDispute(order)} />
            </View>
          )}
          {canCancel && (
            <View className='flex-1'>
              <CustomButton textStyle='text-[12px]' title='Cancel' style='bg-red-600 w-full' onPress={() => onCancel(order.$id)} />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default OrderCard