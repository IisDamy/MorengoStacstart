import { View, Text, ScrollView, Pressable, Alert, Image, ActivityIndicator, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { color, images } from '@/constants'
import { TabsHeader } from '@/components'
import useAuthStore from '@/store/auth.store'
import { Order, User } from '@/types'
import { useCartStore} from '@/store/cart.auth.store'
import { subscribeToOrders, RunPaystackAction, confirmDeliveryOffer, getDeliveryOffers, deleteOrder, fetchOrders } from '@/lib/appwrite'
import { CustomButton, CustomInput } from '@/components'
import { router } from 'expo-router'
import TabSwitcher from '@/components/ui/TabSwitcher'
import useNotificationStore from '@/store/notification.store'
// ---- status presentation helpers -------------------------------------

const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FDF3E7', text: '#C9820A', label: 'Awaiting Rider' },
  accepted: { bg: '#E9F7EF', text: color.moregreen, label: 'Rider Connected' },
  paid: { bg: '#EAF1FF', text: '#2563EB', label: 'Confirmed' },
  in_transit: { bg: '#F0E9FF', text: '#7C3AED', label: 'In Transit' },
  delivered: { bg: '#E9F7EF', text: color.moregreen, label: 'Delivered' },
  cancelled: { bg: '#FBEAEA', text: '#DC2626', label: 'Cancelled' },
}

const getStatusMeta = (status: string) => STATUS_META[status] ?? { bg: '#F3F4F6', text: '#6B7280', label: status }

const StatusPill = ({ status }: { status: string }) => {
  const meta = getStatusMeta(status)
  return (
    <View className='px-3 py-2 rounded-full' style={{ backgroundColor: meta.bg }}>
      <Text className='text-[8.5px] font-[Nunito-bold] uppercase tracking-wide' style={{ color: meta.text }}>
        {meta.label}
      </Text>
    </View>
  )
}

// ---- order card ---------------------------------------------------------

const DISPUTE_WINDOW_MS = 30 * 1000 

const getDisputeTimeLeft = (order: Order) => { const reference = new Date(order.deliveredAt).getTime()
  console.log(order.paidAt, )
  return Math.max(0, DISPUTE_WINDOW_MS - (Date.now() - reference))


}

const formatCountdown = (ms: number) => {
  const secs = Math.ceil(ms / 1000)
  return `0:${secs.toString().padStart(2, '0')}`
}


interface OrderCardProps {
  order: Order
  user: User | null
  onCancel: (orderId: string) => void
  onPay: (order: Order) => void
  onDispute: (order: Order) => void
  canPay?: boolean
  canCancel?: boolean
  canDispute?: boolean
  deliveryOffers?: any[]
  onSelectRider?: (order: Order, offer: any) => void
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
  deliveryOffers = [],
  onSelectRider,
}: OrderCardProps) => {
  const [disputeTimeLeft, setDisputeTimeLeft] = useState(() => (canDispute ? getDisputeTimeLeft(order) : 0))

  useEffect(() => {
    if (!canDispute) return
    setDisputeTimeLeft(getDisputeTimeLeft(order))
    const interval = setInterval(() => setDisputeTimeLeft(getDisputeTimeLeft(order)), 1000)
    return () => clearInterval(interval)
  }, [canDispute, order.$updatedAt])

  const disputeExpired = disputeTimeLeft <= 0

  return (
    <View
      className='w-full bg-white rounded-[18]  border border-zinc-200 p-4 mb-4'
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

      

      {/* Delivery address */}
      <Text className='text-[12px] font-[Nunito-medium] text-zinc-500 mb-3'>
        Delivering to {order.userAddress}
      </Text>
      {order.riderId && <Text className='text-[11px] font-[Nunito-medium] text-zinc-500 mb-3'>
        Expected Rider: <Text className='capitalize  font-[Nunito-bold]'>{order.riderName}</Text>
      </Text>}

      

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
      {order.status === 'pending' && deliveryOffers.length > 0 && (
        <View className='mt-3 pt-3 border-t border-zinc-200'>
          <Text className='text-[11px] py-2 font-[Nunito-bold] uppercase text-zinc-400 mb-2'>
            Riders offering to deliver
          </Text>
          {deliveryOffers.map((offer) => (
            <Pressable
              key={offer.$id}
              onPress={() => onSelectRider?.(order, offer)}
              className='flex-row justify-between items-center mx-4 bg-zinc-50 rounded-[10] px-3 py-3 mb-2 border border-zinc-200'
            >
              <Text className='text-[10px] uppercase font-[Nunito-bold] text-zinc-800'>{offer.riderName}</Text>
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
              <CustomButton textStyle='text-[12px]' title='Make Payment' style='bg-green-500  w-full' onPress={() => onPay(order)} />
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

// ---- misc ----------------------------------------------------------------

const SectionHeading = ({ label }: { label: string }) => (
  <Text className='text-[12px] font-[Nunito-bold] uppercase text-zinc-400 mb-4 '>{label}</Text>
)

interface DisputeModalProps {
  visible: boolean
  reason: string
  onChangeReason: (val: string) => void
  onCancel: () => void
  onSubmit: () => void
  submitting: boolean
}

const DisputeReasonModal = ({ visible, reason, onChangeReason, onCancel, onSubmit, submitting }: DisputeModalProps) => (
  <Modal visible={visible} transparent animationType='fade' onRequestClose={onCancel}>
    <View className='flex-1 items-center justify-center px-6' style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <View className='w-full bg-white rounded-[18] p-5'>
        <Text className='text-[15px] font-[Nunito-bold] text-zinc-800 mb-1'>Raise a Dispute</Text>
        <Text className='text-[12px] font-[Nunito-medium] text-zinc-500 mb-4'>
          Tell us what went wrong with this order.
        </Text>

        <CustomInput
          label='Reason for dispute'
          placeholder='e.g. Item missing, order damaged...'
          value={reason}
          onChangeText={onChangeReason}
          multiline
        />

        <View className='flex-row gap-3 mt-5'>
          <View className='flex-1'>
            <CustomButton title='Cancel' style='bg-zinc-200 w-full' textStyle='text-zinc-700' onPress={onCancel} disabled={submitting} />
          </View>
          <View className='flex-1'>
            <CustomButton
              title={submitting ? 'Submitting...' : 'Submit'}
              style='bg-orange-500 w-full'
              onPress={onSubmit}
              disabled={submitting || reason.trim().length === 0}
            />
          </View>
        </View>
      </View>
    </View>
  </Modal>
)

// ---- screen ---------------------------------------------------------------

const orders = () => {
  const { user } = useAuthStore()
  const { addMsg } = useNotificationStore()
  const [activeGroup, setActiveGroup] = useState('Pending')
  const orderStage = ['Pending', 'Confirmed', 'Delivered']
  const [loading, setLoading] = useState(true)
  const { items } = useCartStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveryOffers, setDeliveryOffers] = useState<Record<string, any[]>>({})

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
            })
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
      user?.$id
    )

    return unsubscribe
  }, [])

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

export default orders