import { View, Text, Image } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Order } from '@/types'
import { color } from '@/constants'
import { getPlaceholderCustomer, STAGES, StageKey, getStageIndex } from './orderHelpers'
import StagePill from './StagePill'

// ---- countdown for the rider's promised delivery time ------------------
// Starts as soon as the card mounts (i.e. as soon as the order shows up in
// the Active tab) and counts down from `expectedTimeDelivery` (minutes).

interface DeliveryCountdownProps {
  expectedTimeDelivery?: number
}

const DeliveryCountdown = ({ expectedTimeDelivery }: DeliveryCountdownProps) => {
  const deadlineRef = useRef<number | null>(
    expectedTimeDelivery ? Date.now() + expectedTimeDelivery * 60_000 : null
  )
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() =>
    deadlineRef.current !== null ? Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000)) : null
  )

  useEffect(() => {
    if (deadlineRef.current === null) return

    const interval = setInterval(() => {
      setRemainingSeconds(Math.max(0, Math.round((deadlineRef.current! - Date.now()) / 1000)))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (remainingSeconds === null) return null

  const isOverdue = remainingSeconds <= 0
  const mm = Math.floor(remainingSeconds / 60).toString().padStart(2, '0')
  const ss = (remainingSeconds % 60).toString().padStart(2, '0')

  return (
    <View
      className='rounded-[10] px-3 py-2 mb-3 flex-row items-center justify-between'
      style={{ backgroundColor: isOverdue ? '#FEE2E2' : '#fdf6ef' }}
    >
      <Text
        className='text-[11px] font-[Nunito-bold] uppercase'
        style={{ color: isOverdue ? '#DC2626' : color.morange }}
      >
        {isOverdue ? 'Overdue' : 'Time left'}
      </Text>
      <Text
        className='text-[14px] font-[Nunito-bold]'
        style={{ color: isOverdue ? '#DC2626' : color.moregreen }}
      >
        {isOverdue ? `${mm}:${ss} over` : `${mm}:${ss}`}
      </Text>
    </View>
  )
}

// ---- active order card (accepted, progress through delivery stages) ---

interface ActiveOrderCardProps {
  order: Order
  onUpdateStage: (order: Order, newStatus: StageKey) => void
  updating: boolean
}

const ActiveOrderCard = ({ order, onUpdateStage, updating }: ActiveOrderCardProps) => {
  const customer = useMemo(() => getPlaceholderCustomer(order.customerId), [order.customerId])
  const currentIndex = getStageIndex(order.status) // -1 while still just 'accepted'
  const nextIndex = currentIndex + 1

  return (
    <View
      className='w-full bg-white rounded-[18] border border-zinc-200 p-4 mb-4'
      style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }}
    >
      <DeliveryCountdown expectedTimeDelivery={order.expectedTimeDelivery} />

      <View className='mb-6 mt-2'>
        <View className='flex-row -mx-1'>
          {STAGES.map((stage, idx) => {
            const state =
              idx < currentIndex ? 'done' : idx === currentIndex ? 'current' : idx === nextIndex ? 'next' : 'locked'
            return (
              <StagePill
                key={stage.key}
                label={stage.label}
                state={state}
                updating={updating}
                onPress={() => onUpdateStage(order, stage.key)}
              />
            )
          })}
        </View>
      </View>

      {/* Customer header */}
      <View className='flex-row items-center gap-3 mb-3'>
        <View
          className='h-9 w-9 pt-2 rounded-full items-start justify-start'
          style={{ backgroundColor: customer.color }}
        >
          <Text className='w-20 text-[9px] whitespace-nowrap uppercase text-start font-[Crispy] text-white'>
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
          ₦{order.subtotal}
        </Text>
      </View>
    </View>
  )
}

export default ActiveOrderCard