import { View, Text, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RunPaystackAction, subscribeToOrders, createDeliveryOffer } from '@/lib/appwrite'
import { Order } from '@/types'
import useAuthStore from '@/store/auth.store'
import { SafeAreaView } from 'react-native-safe-area-context'
import { color } from '@/constants'
import { TabsHeader } from '@/components'
import TabSwitcher from '@/components/ui/TabSwitcher'
import { MAX_ORDERS, StageKey } from '@/components/orderHelpers'
import {RiderOrderCard, ActiveOrderCard} from '@/components'
import { getCurrentLocation } from '@/lib/utils'
import { RELEVANT_STATUSES } from '@/constants'

const CheckOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [fees, setFees] = useState<Record<string, string>>({})
  const [expectedTimes, setExpectedTimes] = useState<Record<string, string>>({})
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState('Pending')
  const tabs = ['Pending', 'Active']
  const { user } = useAuthStore()
  const [offeredIds, setOfferedIds] = useState<Set<string>>(new Set())

  const handleChangeFee = (orderId: string, value: string) => {
    setFees((prev) => ({ ...prev, [orderId]: value }))
  }

  const handleChangeExpectedTimeDelivery = (orderId: string, value: string) => {
    setExpectedTimes((prev) => ({ ...prev, [orderId]: value }))
  }

  const handleAccept = async (order: Order) => {
    const deliveryFee = fees[order.$id]
    const expectedTimeDelivery = expectedTimes[order.$id]
    if (!deliveryFee || !expectedTimeDelivery) return

    setAcceptingId(order.$id)
    try {
      const cords = await getCurrentLocation()

      await createDeliveryOffer({
        orderId: order.$id,
        riderId: user.$id,
        riderName: user?.name,
        deliveryFee: Number(deliveryFee),
        expectedTimeDelivery: Number(expectedTimeDelivery),
        lng: cords[0],
        lat: cords[1]
      })
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
      ordersRes = ordersRes.orders.map((order) => ({ ...order, items: JSON.parse(order.items) }))
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
  useEffect(() => {
    

    const unsubscribe = subscribeToOrders(
      (updatedOrder) => {
        if (!RELEVANT_STATUSES.includes(updatedOrder.status)) return

        setOrders((prev) => {
          const exists = prev.some((o) => o.$id === updatedOrder.$id)
          if (!exists) return [updatedOrder, ...prev].slice(0, MAX_ORDERS)
          return prev.map((o) => (o.$id === updatedOrder.$id ? updatedOrder : o))
        })
      },
      () => {},
       // payout
      ()=>{},
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  expectedTimeDelivery={expectedTimes[order.$id] ?? ''}
                  onChangeExpectedTimeDelivery={handleChangeExpectedTimeDelivery}
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