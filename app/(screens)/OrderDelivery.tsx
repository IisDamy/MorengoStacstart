import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { getAllCustomersOrders, RunPaystackAction,subscribeToOrders, createDeliveryOffer } from '@/lib/appwrite'
import { Order } from '@/types'
import useAuthStore from '@/store/auth.store'
import { SafeAreaView } from 'react-native-safe-area-context'
import { color } from '@/constants'
import { TabsHeader, CustomButton } from '@/components'
import { PopupWrapper } from '@/components'
import TabSwitcher from '@/components/ui/TabSwitcher'


const MAX_ORDERS = 52

const AVATAR_COLORS = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6']

const hashString = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getPlaceholderCustomer = (customerId: string) => {
  const h = hashString(customerId || 'unknown')
  return {
    color: AVATAR_COLORS[h % AVATAR_COLORS.length],
  }
}

// ---- delivery stage progression (Active tab) -------------------------

const STAGES = [
  { key: 'preparing', label: 'Preparing' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
] as const

type StageKey = typeof STAGES[number]['key']

// order.status is 'accepted' before any stage has been set, hence -1
const getStageIndex = (status: string) => STAGES.findIndex((s) => s.key === status)

interface StagePillProps {
  label: string
  state: 'done' | 'current' | 'next' | 'locked'
  onPress: () => void
  updating: boolean
}

const StagePill = ({ label, state, onPress, updating }: StagePillProps) => {
  const bg =
    state === 'done' || state === 'current'
      ? color.moregreen
      : state === 'next'
      ? '#FCEBD8'
      : '#fdf6ef'
  const textColor =
    state === 'done' || state === 'current' ? '#fff' : state === 'next' ? '#A1A1AA' : '#A1A1AA'

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={state !== 'next' || updating}
      className='flex-1 items-center justify-center rounded-[10] py-2 mx-1'
      style={{ backgroundColor: bg, opacity: updating && state === 'next' ? 0.6 : 1 }}
    >
      <Text
        className='text-[9px] font-[Nunito-bold] uppercase'
        style={{ color: textColor }}
      >
        {state === 'next' && updating ? '...' : label}
      </Text>
    </TouchableOpacity>
  )
}

// ---- pending order card (unclaimed, offer a delivery fee) -------------

interface RiderOrderCardProps {
  order: Order
  deliveryFee: string
  onChangeFee: (orderId: string, value: string) => void
  onAccept: (order: Order) => void
  accepting: boolean
  offered: boolean
}

const RiderOrderCard = ({ order, deliveryFee, onChangeFee, onAccept, accepting, offered }: RiderOrderCardProps) => {
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
        <Text className='text-[12px] font-[nunito-medium] text-zinc-700 mt-0.5'>{order.userAddress}</Text>
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

      {/* Accept */}
    <View className='mt-4'>
  <CustomButton
    title={offered ? 'Awaiting customer connection' : accepting ? 'Accepting…' : 'Accept Order'}
    style={`w-full ${offered ? 'bg-zinc-300' : deliveryFee ? 'bg-green-500' : 'bg-zinc-300'}`}
    disabled={!deliveryFee || accepting || offered}
    onPress={() => onAccept(order)}
  />
</View>
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
        <Text className='text-[12px] font-[nunito-medium] text-zinc-700 mt-0.5'>{order.userAddress}</Text>
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

      {/* Stage progress */}
      
    </View>
  )
}

const CheckOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [fees, setFees] = useState<Record<string, string>>({})
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState('Pending')
  const tabs = ['Pending', 'Active']
  const { user } = useAuthStore()
const [offeredIds, setOfferedIds] = useState<Set<string>>(new Set())


  const handleChangeFee = (orderId: string, value: string) => {
    setFees((prev) => ({ ...prev, [orderId]: value }))
  }

const handleAccept = async (order: Order) => {
  const deliveryFee = fees[order.$id]
  if (!deliveryFee) return

  setAcceptingId(order.$id)
  try {
    await createDeliveryOffer({ orderId: order.$id, riderId: user.$id, riderName: user?.name, deliveryFee: Number(deliveryFee) })
    setOfferedIds((prev) => new Set(prev).add(order.$id))
  } catch (error) {
    console.error('Error accepting order:', error)
  } finally {
    setAcceptingId(null)
  }
}

  const handleUpdateStage = async (order: Order, newStatus: StageKey) => {
    setUpdatingId(order.$id)
    try {
      await RunPaystackAction('order.updateStatus', {
        orderId: order.$id,
        actorId: user?.$id,
        actorRole: user?.role,
        newStatus,
        riderId: user?.$id,
        reason: '',
      })

      if (newStatus === 'delivered') {
        setOrders((prev) => prev.filter((o) => o.$id !== order.$id))
      } else {
        setOrders((prev) => prev.map((o) => (o.$id === order.$id ? { ...o, status: newStatus } : o)))
      }
    } catch (error) {
      console.error('Error updating order stage:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const getOrders = async () => {
    setLoading(true)
    try {
      let ordersRes = await RunPaystackAction('order.getAll', {
        userId: user?.$id,
      })
      ordersRes = ordersRes.data.orders.map((order) => ({ ...order, items: JSON.parse(order.items) }))
      setOrders(ordersRes.slice(0, MAX_ORDERS))
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getOrders()
  }, [])

  // ---- live updates ----
// ---- live updates ----
  useEffect(() => {
    const RELEVANT_STATUSES = ['accepted','cancelled', 'disputed', 'settled']

    const unsubscribe = subscribeToOrders(
      (updatedOrder) => {
        if (!RELEVANT_STATUSES.includes(updatedOrder.status)) return

        setOrders((prev) => {
          const exists = prev.some((o) => o.$id === updatedOrder.$id)
          if (!exists) return [updatedOrder, ...prev].slice(0, MAX_ORDERS)
          return prev.map((o) => (o.$id === updatedOrder.$id ? updatedOrder : o))
        })
      },
      () => {
       
      },
      user?.$id
    )

    return unsubscribe
  }, [user?.$id])



  // ---- filtering per tab (client-side) ----
  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const activeOrders = orders.filter((o) =>
    ['paid', 'preparing', 'in_transit'].includes(o.status)
  )

  const visibleOrders = currentTab === 'Active' ? activeOrders : pendingOrders

  return (
    <SafeAreaView className='h-full w-full items-center bg-white pb-10'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='h-full w-full bg-white flex px-6 items-center'
      >
        <TabsHeader tabName='Open Orders' />
        <View className='px-11 mb-0 '>
          <TabSwitcher stages={tabs} activeGroup={currentTab} onChange={(o) => setCurrentTab(o)} />
        </View>

        {loading ? (
          <ActivityIndicator className='mt-10' color={color.moregreen} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className='w-full mt-0'>
            {visibleOrders.length === 0 && (
              <Text
                className='text-center font-[Crispy] mt-[280] rotate-[10deg] text-[16px]'
                style={{ color: color.morange }}
              >
                No {currentTab === 'Active' ? 'active' : 'open'} orders
              </Text>
            )}

           {currentTab === 'Pending' &&
            pendingOrders.map((order) => (
              <RiderOrderCard
                key={order.$id}
                order={order}
                deliveryFee={fees[order.$id] ?? ''}
                onChangeFee={handleChangeFee}
                onAccept={handleAccept}
                accepting={acceptingId === order.$id}
                offered={offeredIds.has(order.$id)}
              />
  ))}
            {currentTab === 'Active' &&
              activeOrders.map((order) => (
                <ActiveOrderCard
                  key={order.$id}
                  order={order}
                  onUpdateStage={handleUpdateStage}
                  updating={updatingId === order.$id}
                />
              ))}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default CheckOrders