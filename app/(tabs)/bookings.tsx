import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import * as WebBrowser from 'expo-web-browser' // assumption: not yet imported elsewhere for checkout
import { color } from '@/constants'
import {
  NotificationBell,
  TabsHeader,
  ToggleButton,
} from '@/components'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { ScrollView } from 'react-native'
import { useTabBarVisibility } from '@/contexts/TabBarVisibilityContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { signOut } from '@/lib/appwrite'
import useAuthStore from '@/store/auth.store'
import useNotificationStore from '@/store/notification.store'
import BookingCard, { Booking } from '@/components/BookingCard'
import { getBookings, RunPaystackAction } from '@/lib/appwrite'


const Bookings = () => {
  const { user } = useAuthStore()
  const { onScroll } = useTabBarVisibility()
  const { addMsg, msgs } = useNotificationStore()

  const [enablePromoNotifs, setEnablePromoNotifs] = useState(true)
  const [enableNotifs, setEnableNotifs] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const toggleSwitchNotifs = () =>
    setEnableNotifs(previousState => !previousState)

  const toggleSwitchPromo = () => {
    setEnablePromoNotifs(prev => !prev)
    addMsg({
      text: 'Order has been delivered',
      type: 'success',
    })
    console.log(msgs)
  }

  const LogOff = async () => {
    try {
      await signOut()
      router.replace('/(auth)/sign-in')
    } catch (e) {
      console.error(e)
    }
  }

  const fetchBookings = useCallback(async () => {
    if (!user?.$id) return

    try {
      const result = await getBookings(user.$id)

      if (result) {
        setBookings(result)
      }
    } catch (e) {
      console.error(e)
    }
  }, [user?.$id])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)

    try {
      await fetchBookings()
    } finally {
      setRefreshing(false)
    }
  }, [fetchBookings])

  // Resume/start payment for a booking still sitting in pending_payment —
  // re-runs payment.initialize against the same booking id, then sends the
  // customer to Paystack checkout. Mirrors the flow in BrowseEvents.
  const handlePay = useCallback(async (booking: Booking) => {
    if (!user?.$id) return

    let paymentRes
    try {
      paymentRes = await RunPaystackAction('payment.initialize', {
        customerId: user.$id,
        customerEmail: user.email, // assumption: user.email exists on your auth store's user object
        fieldId: booking.$id,
        field: 'booking',
        total: booking.total,
      })
    } catch (e) {
      console.error(e)
      Alert.alert('Error', 'Could not start payment. Try again.')
      return
    }

    if (!paymentRes?.data?.authorizationUrl) {
      Alert.alert('Error', paymentRes?.message || 'Payment could not be started.')
      return
    }

    const result = await WebBrowser.openAuthSessionAsync(paymentRes.data.authorizationUrl)
    if (result.type !== 'success' && result.type !== 'dismiss') return

    try {
      const verifyRes = await RunPaystackAction('payment.verify', {
        reference: paymentRes.data.paymentReference,
      })

      if (verifyRes?.data?.paid) {
        Alert.alert('Paid! 🎉', 'Your booking is confirmed.')
      } else {
        Alert.alert('Almost there', "We're still confirming your payment — pull to refresh shortly.")
      }
    } catch (e) {
      console.error(e)
      Alert.alert('Almost there', "We're still confirming your payment — pull to refresh shortly.")
    } finally {
      fetchBookings()
    }
  }, [user, fetchBookings])

  // Only reachable from a "paid" booking — matches booking.js's ALLOWED map,
  // where customers can cancel from "paid" but not once a provider has
  // confirmed. reason is hardcoded here; swap for a text prompt if you want
  // the customer to supply their own.
  const handleCancel = useCallback((bookingId: string) => {
    Alert.alert(
      'Cancel booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep booking', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: async () => {
            if (!user?.$id) return
            try {
              await RunPaystackAction('booking.updateStatus', {
                bookingId,
                actorId: user.$id,
                actorRole: 'customer',
                newStatus: 'cancelled',
                reason: 'Cancelled by customer',
              })
            } catch (e) {
              console.error(e)
              Alert.alert('Error', 'Could not cancel the booking.')
            } finally {
              fetchBookings()
            }
          },
        },
      ]
    )
  }, [user, fetchBookings])

  return (
    <SafeAreaView className="bg-white px-4 min-h-screen">
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <TabsHeader tabName="Bookings" />

        <View className='mt-2'>
           {bookings.length > 0 ? (
          <FlatList
            data={bookings}
            keyExtractor={item => item.$id}
            renderItem={({ item }) => (
              <BookingCard
                booking={item}
                user={user}
                canPay={item.status === 'pending_payment'}
                canCancel={item.status === 'paid'}
                onPay={handlePay}
                onCancel={handleCancel}
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text className="text-zinc-500">
            No bookings found.
          </Text>
        )}
        </View>

       
      </ScrollView>
    </SafeAreaView>
  )
}

export default Bookings