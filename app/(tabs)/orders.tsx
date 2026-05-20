import { View, Text, ScrollView, Pressable, Alert, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { color } from '@/constants'
import { TabsHeader } from '@/components'
import { deleteOrder, fetchOrders } from '@/lib/appwrite'
import useAuthStore from '@/store/auth.store'
import { Order } from '@/types'
import { useCartStore } from '@/store/cart.auth.store'
import { subscribeToOrders } from '@/lib/appwrite'
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { scheduleOnRN } from 'react-native-worklets'
import useNotificationStore from '@/store/notification.store'


const SwipeToCancel = ({ children, onSwipe }: { children: React.ReactNode; onSwipe: () => void }) => {
  const translateX = useSharedValue(0)

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX
      }
    })
    .onEnd((e) => {
      if (e.translationX < -50 ) {
        translateX.value = withSpring(0, { damping: 20, stiffness: 100 }, () => {
          scheduleOnRN(onSwipe)
        })
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 100 })
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  )
}


const orders = () => {
  const { user } = useAuthStore()
  const { addMsg } = useNotificationStore()
  const [activeGroup, setActiveGroup] = useState('Pending')
  const orderStage = ['Pending', 'Confirmed', 'Delivered']
  const [openCancelPending, setOpenCancelPending] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { items } = useCartStore()

  const getOrders = async () => {
    setLoading(true)
    try {
      const ordersRes = await fetchOrders(user.$id)
      if (!ordersRes) {}
      setOrders(ordersRes)
      console.log(ordersRes)
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
    if (items.length === 0) {
      getOrders()
    }
  }, [items])

  useEffect(() => {
    const unsubscribe = subscribeToOrders((updatedOrder) => {
      addMsg({ text: `Order ${updatedOrder.status.toLowerCase()}`, type: 'success' })
      setOrders((prev) =>
        prev.map((order) =>
          order.$id === updatedOrder.$id ? updatedOrder : order
        )
      )
      console.log(updatedOrder, 'www')
    }, user?.$id)

    return unsubscribe
  }, [])

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
            setOpenCancelPending(null)
          } catch (e) {
            console.error('Cancel order error:', e)
            addMsg({ text: 'Failed to cancel order', type: 'error' })
          }
        },
      },
    ])
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className='h-full w-full items-center bg-white pb-10'>
        <View className='h-full w-full bg-white flex px-6 items-center'>
          <TabsHeader tabName='Orders' />
          <View className='flex-row w-full mt-12 pb-3 border-b border-zinc-300 justify-between'>
            {orderStage.map((group, index) => (
              <Pressable key={index} onPress={() => setActiveGroup(group)}>
                <Text
                  className='py-3 font-[Nunito-bold]'
                  style={{
                    color: activeGroup === group ? color.moregreen : '#404a3854',
                    fontSize: 14,
                  }}
                >
                  {group}
                </Text>
              </Pressable>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator className='mt-10' color={color.moregreen} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} className='w-full'>
              {orders.length === 0 && (
                <Text className='text-center text-zinc-400 mt-10'>
                  No {activeGroup.toLowerCase()} orders
                </Text>
              )}

              {orders.map((order) => (
                <SwipeToCancel key={order.$id} onSwipe={() => handleCancel(order.$id)}>
                  <Pressable
                    onPress={() => setOpenCancelPending(null)}
                    onLongPress={() =>
                      setOpenCancelPending(openCancelPending === order.$id ? null : order.$id)
                    }
                    delayLongPress={300}
                  >
                    <View className='mt-4 w-full border-b p-1 border-zinc-300'>
                      {/* User name + time */}
                      <View className='flex-row justify-between mb-2'>
                        <Text className='text-[13px] font-[Nunito-bold] text-zinc-700'>{user?.name} {order.status}</Text>
                        <Text className='text-[12px] text-zinc-400'>
                          {new Date(order.$createdAt).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' · '}
                          {new Date(order.$createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>

                      {/* Order items */}
                      {order.items.map((item, idx) => (
                        <View key={`${order.$id}-${idx}`} className='pb-4 flex-row gap-4'>
                          <Image
                            source={{ uri: item.image }}
                            className='rounded-[10] h-20 w-20 bg-zinc-200'
                            resizeMode='cover'
                          />
                          <View className='flex-row w-[230] justify-between'>
                            <View className='flex gap-3'>
                              <Text className='text-[14px] font-bold'>{item.fullName}</Text>
                              <Text className='text-[12px] font-bold'>{order.userAddress}</Text>
                            </View>
                            <Text className='text-[13px] font-bold' style={{ color: color.moregreen }}>
                              ₦{item.price * item.quantity}
                            </Text>
                          </View>
                        </View>
                      ))}

                      {/* Long-press cancel button */}
                      {openCancelPending === order.$id && (
                        <Animated.View
                          entering={FadeInDown.springify().damping(12).stiffness(180).mass(0.7)}
                          
                          className='mb-2'
                        >
                          <Animated.View
                            entering={ZoomIn.springify().damping(18).stiffness(120).mass(0.8)}
                          >
                            <Pressable
                              onPress={() => handleCancel(order.$id)}
                              style={({ pressed }) => ({
                                transform: [{ scale: pressed ? 0.96 : 1 }],
                              })}
                              className='bg-red-500 rounded-[8] py-3 items-center'
                            >
                              <Text className='text-white tracking-wide text-md font-[Nunito-bold]'>
                                Cancel
                              </Text>
                            </Pressable>
                          </Animated.View>
                        </Animated.View>
                      )}
                    </View>
                  </Pressable>
                </SwipeToCancel>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default orders