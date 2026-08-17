import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { color } from '@/constants'
import { TabsHeader } from '@/components'
import useAuthStore from '@/store/auth.store'
import { Order, DeliveryOpts } from '@/types'
import { useCartStore } from '@/store/cart.auth.store'
import { subscribeToOrders, RunPaystackAction, confirmDeliveryOffer, getDeliveryOffers, deleteOrder, fetchOrders } from '@/lib/appwrite'
import { router } from 'expo-router'
import TabSwitcher from '@/components/ui/TabSwitcher'
import useNotificationStore from '@/store/notification.store'
import useActiveOrderStore from '@/store/activeOrderStore'
import { OrderCard, SectionHeading, DisputeReasonModal } from '@/components'

const OrdersScreen = () => {
  const { user } = useAuthStore()
  const { addMsg } = useNotificationStore()
  const [activeGroup, setActiveGroup] = useState('Pending')
  const orderStage = ['Pending', 'Confirmed', 'Delivered']
  const [loading, setLoading] = useState(true)
  const { items } = useCartStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveryOffers, setDeliveryOffers] = useState<Record<string, any[]>>({})
  const { activeOrder, setActiveOrder, setRiderOpts,clearRiderOpts,riderOpts,  clearActiveOrder, updateActiveOrder } = useActiveOrderStore()

  // dispute modal state
  const [disputeModalVisible, setDisputeModalVisible] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeOrder, setDisputeOrder] = useState<Order | null>(null)
  const [submittingDispute, setSubmittingDispute] = useState(false)

  const handleCancel = (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOrder(orderId)
            setOrders((prev) => prev.filter((o) => o.$id !== orderId))
          } catch (e) {
            console.error('Cancel order error:', e)
            addMsg({ text: 'Failed to cancel order', type: 'error' })
          }
        },
      },
    ])
  }

  const handlePay = async (order: Order) => {
    try {
      const pay = await RunPaystackAction('payment.initialize', {
        customerId: user.$id,
        riderId: order.riderId,
        items: order.items,
        total: order.total,
        orderId: order.$id,
        customerEmail: user?.email,
      })

      if (pay) {
        router.push(pay.data.authorizationUrl)
      }
    } catch (e) {
      console.error('Payment error:', e)
      addMsg({ text: 'Failed to start payment', type: 'error' })
    }
  }

  const handleDispute = (order: Order) => {
    setDisputeOrder(order)
    setDisputeReason('')
    setDisputeModalVisible(true)
  }

  const closeDisputeModal = () => {
    if (submittingDispute) return
    setDisputeModalVisible(false)
    setDisputeOrder(null)
    setDisputeReason('')
  }

  const submitDispute = async () => {
    if (!disputeOrder || disputeReason.trim().length === 0) return

    setSubmittingDispute(true)
    try {
      await RunPaystackAction('update.status', {
        orderId: disputeOrder.$id,
        actorId: user?.$id,
        actorRole: user?.role,
        newStatus: 'disputed',
        riderId: disputeOrder.riderId,
        reason: disputeReason.trim(),
      })
      addMsg({ text: 'Dispute submitted', type: 'success' })
      setDisputeModalVisible(false)
      setDisputeOrder(null)
      setDisputeReason('')
    } catch (e) {
      console.error('Dispute error:', e)
      addMsg({ text: 'Failed to raise dispute', type: 'error' })
    } finally {
      setSubmittingDispute(false)
    }
  }

  const handleSelectRider = (order: Order, offer: any) => {
    Alert.alert('Confirm Rider', `Accept ${offer.riderName} for ₦${offer.deliveryFee} delivery?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            const updatedOrder = await confirmDeliveryOffer({
              orderId: order.$id,
              riderId: offer.riderId,
              riderName: offer.riderName,
              deliveryFee: offer.deliveryFee,
              offerId: offer.$id,
            })
            setActiveOrder({ $id: updatedOrder.$id, status: updatedOrder.status })
            setOrders((prev) =>
              prev.map((o) =>
                o.$id === order.$id
                  ? {
                      ...o,
                      status: updatedOrder.status,
                      riderId: updatedOrder.riderId,
                      riderName: updatedOrder.riderName,
                      deliveryFee: updatedOrder.deliveryFee,
                      platformFee: updatedOrder.platformFee,
                      total: updatedOrder.total,
                    }
                  : o
              )
            )
            setDeliveryOffers((prev) => {
              const next = { ...prev }
              delete next[order.$id]
              return next
            })
          } catch (e) {
            console.error('Select rider error:', e)
            addMsg({ text: 'Failed to confirm rider', type: 'error' })
          }
        },
      },
    ])
  }

  const getOrders = async () => {
    setLoading(true)
    try {
      const ordersRes = await fetchOrders(user.$id)
      setOrders(ordersRes)

      if (activeOrder) {
        const matchedOrder = ordersRes.find((order) => order.$id === activeOrder.$id)

        if (matchedOrder) {
          updateActiveOrder({ $id: matchedOrder.$id, status: matchedOrder.status })
        } else {
          clearActiveOrder()
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getOrders()
  }, [])

  useEffect(() => {
    const pending = orders.filter((o) => o.status === 'pending')
    if (pending.length === 0) return

    ;(async () => {
      const entries = await Promise.all(
        pending.map(async (o) => [o.$id, (await getDeliveryOffers(o.$id)) ?? []] as const)
      )
      setDeliveryOffers(Object.fromEntries(entries))
    })()
  }, [orders])

  useEffect(() => {
    if (items.length === 0) {
      getOrders()
    }
  }, [items])

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (updatedOrder) => {
        addMsg({ text: `Order ${updatedOrder.status.toLowerCase()}`, type: 'success' })
        setOrders((prev) => prev.map((o) => (o.$id === updatedOrder.$id ? updatedOrder : o)))

        const currentActiveOrder = useActiveOrderStore.getState().activeOrder
        if (currentActiveOrder?.$id === updatedOrder.$id) {
          updateActiveOrder({ $id: updatedOrder.$id, status: updatedOrder.status })
        }
      },
      (updatedCharge) => {
        setDeliveryOffers((prev) => {
          const existing = prev[updatedCharge.orderId] ?? []
          const already = existing.some((o) => o.$id === updatedCharge.$id)
          return {
            ...prev,
            [updatedCharge.orderId]: already
              ? existing.map((o) => (o.$id === updatedCharge.$id ? updatedCharge : o))
              : [...existing, updatedCharge],
          }
        })
      },
      user?.$id,
    )

    return unsubscribe
  }, [])

  useEffect(()=> {
    if (!deliveryOffers && riderOpts) {clearRiderOpts()}
    else if (deliveryOffers) {
      const opts = deliveryOffers.map(offer =>{ 
      const {riderName, expectedTimeDelivery, deliveryFee, lat, lng} = offer
      return {name: riderName, time: expectedTimeDelivery,lat, lng, price:deliveryFee }})
      console.log(opts)
      setRiderOpts(opts)}
  },[deliveryOffers])

  // filter
  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const acceptedOrders = orders.filter((o) => o.status === 'accepted')
  const confirmedOrders = orders.filter((o) => o.status === 'paid' || o.status === 'in_transit')
  const deliveredOrders = orders.filter((o) => o.status === 'delivered')

  const visibleCount =
    activeGroup === 'Pending'
      ? pendingOrders.length + acceptedOrders.length
      : activeGroup === 'Confirmed'
      ? confirmedOrders.length
      : deliveredOrders.length

  return (
    <SafeAreaView className='h-full w-full items-center bg-white pb-10'>
      <View className='h-full w-full bg-white flex px-6 items-center'>
        <TabsHeader tabName='Orders' />

        <TabSwitcher stages={orderStage} activeGroup={activeGroup} onChange={setActiveGroup} />

        {loading ? (
          <ActivityIndicator className='mt-10' color={color.moregreen} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className='w-full'>
            {visibleCount === 0 && (
              <Text className='text-center font-[Crispy] mt-[256] -rotate-[10deg] text-[16px]' style={{ color: color.morange }}>
                No {activeGroup.toLowerCase()} orders
              </Text>
            )}

            {activeGroup === 'Pending' && (
              <>
                {pendingOrders.length > 0 && (
                  <View className='mb-2 mt-6'>
                    {pendingOrders.map((order) => (
                      <OrderCard
                        key={order.$id}
                        order={order}
                        user={user}
                        onCancel={handleCancel}
                        onPay={handlePay}
                        onDispute={handleDispute}
                        canPay={false}
                        canCancel={true}
                        deliveryOffers={deliveryOffers[order.$id] ?? []}
                        onSelectRider={handleSelectRider}
                      />
                    ))}
                  </View>
                )}

                {acceptedOrders.length > 0 && (
                  <View>
                    <SectionHeading label='Ready for payment' />
                    {acceptedOrders.map((order) => (
                      <OrderCard
                        key={order.$id}
                        order={order}
                        user={user}
                        onCancel={handleCancel}
                        onPay={handlePay}
                        onDispute={handleDispute}
                        canPay={true}
                        canCancel={true}
                      />
                    ))}
                  </View>
                )}
              </>
            )}

            {activeGroup === 'Confirmed' &&
              confirmedOrders.map((order) => (
                <OrderCard key={order.$id} order={order} user={user} onCancel={handleCancel} onPay={handlePay} onDispute={handleDispute} />
              ))}

            {activeGroup === 'Delivered' &&
              deliveredOrders.map((order) => (
                <OrderCard
                  key={order.$id}
                  order={order}
                  user={user}
                  onCancel={handleCancel}
                  onPay={handlePay}
                  onDispute={handleDispute}
                  canDispute={true}
                />
              ))}
          </ScrollView>
        )}
      </View>

      <DisputeReasonModal
        visible={disputeModalVisible}
        reason={disputeReason}
        onChangeReason={setDisputeReason}
        onCancel={closeDisputeModal}
        onSubmit={submitDispute}
        submitting={submittingDispute}
      />
    </SafeAreaView>
  )
}

export default OrdersScreen