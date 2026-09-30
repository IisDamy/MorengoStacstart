import { color } from '@/constants'
import { CustomButton } from '@/components'
import { User } from '@/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { View, Text } from 'react-native'


// ─── Types ────────────────────────────────────────────────────────────────
// Aligned with the backend's booking.js / payment.js contract:
//   customerId, providerId, total, status — those four are what the
//   handlers actually read. Everything else (eventName, dateTime, etc.) is
//   booking-specific metadata the backend doesn't touch.

export interface Booking {
  $id: string
  $createdAt: string
  customerId: string
  providerId: string
  eventId: string
  dateTime: string
  time: string
  status:
    | 'pending_payment'
    | 'paid'
    | 'confirmed'
    | 'completed'
    | 'settled'
    | 'cancelled'
    | 'disputed'
    | 'refunded'
    | 'payment_failed'
    | 'amount_mismatch'
  eventName: string
  eventType: string
  eventLocation: string
  eventCoords: number[]
  eventDuration: number
  offerName?: string
  total?: number
}

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cosmetics: 'color-palette-outline',
  handywork: 'hammer-outline',
  'private lessons': 'school-outline',
  barbing: 'cut-outline',
  other: 'sparkles-outline',
}

// bg/text pairs picked to stay readable on the zinc-50 header background
const STATUS_META: Record<Booking['status'], { label: string; bg: string; text: string }> = {
  pending_payment: { label: 'Awaiting payment', bg: '#fdf4d2', text: '#f89951' },
  paid:            { label: 'Paid',             bg: '#dcfce7', text: '#15803d' },
  confirmed:       { label: 'Confirmed',        bg: '#dbeafe', text: '#1d4ed8' },
  completed:       { label: 'Completed',        bg: '#e0e7ff', text: '#4338ca' },
  settled:         { label: 'Settled',          bg: '#e0e7ff', text: '#4338ca' },
  cancelled:       { label: 'Cancelled',        bg: '#f4f4f5', text: '#71717a' },
  disputed:        { label: 'Disputed',         bg: '#fee2e2', text: '#b91c1c' },
  refunded:        { label: 'Refunded',         bg: '#f4f4f5', text: '#71717a' },
  payment_failed:  { label: 'Payment failed',   bg: '#fee2e2', text: '#b91c1c' },
  amount_mismatch: { label: 'Payment issue',    bg: '#fee2e2', text: '#b91c1c' },
}

interface BookingCardProps {
  booking: Booking
  user: User | null
  onCancel?: (bookingId: string) => void
  onPay?: (booking: Booking) => void
  canPay?: boolean
  canCancel?: boolean
}

const BookingCard = ({
  booking,
  user,
  onCancel,
  onPay,
  canPay = false,
  canCancel = false,
}: BookingCardProps) => {
  const scheduledDate = new Date(booking.dateTime)
  const typeIcon = TYPE_ICONS[booking.eventType ?? ''] ?? 'sparkles-outline'
  const statusMeta = STATUS_META[booking.status]

  return (
    <View
      className='w-full bg-white rounded-[18] border border-zinc-200 p-4 mb-4 '
      style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }}
    >
      {/* Header: provider name, booked-on time, live status */}
      <View className='flex-row justify-between items-start mb-3'>
        <View>
          <Text className='text-[13px] font-[Nunito-bold] text-zinc-800'>{user?.name}</Text>
          <Text className='text-[11px] font-[Nunito-regular] text-zinc-400 mt-0.5'>
            Booked {new Date(booking.$createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>

        {statusMeta && (
          <View
            className='px-2.5 py-1 rounded-full'
            style={{ backgroundColor: statusMeta.bg }}
          >
            <Text
              className='text-[8px] font-[Nunito-bold] uppercase tracking-wide'
              style={{ color: statusMeta.text }}
            >
              {statusMeta.label}
            </Text>
          </View>
        )}
      </View>

      {/* Scheduled date & time */}
      <View className='flex-row items-center py-3 px-3 border-zinc-200 bg-zinc-50 rounded-[10] mb-3'>
        <Ionicons name='calendar-outline' size={14} color='#a1a1aa' />
        <Text className='text-[12px] font-[Nunito-medium] text-zinc-500 ml-1.5'>
          {!isNaN(scheduledDate.getTime())
            ? scheduledDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
            : booking.dateTime}
        </Text>
        <Text className='text-[12px] text-zinc-300 mx-2'>•</Text>
        <Ionicons name='time-outline' size={14} color='#a1a1aa' />
        <Text className='text-[12px] font-[Nunito-medium] text-zinc-500 ml-1.5'>{booking.time}</Text>
      </View>

      {/* Service */}
      <View className='rounded-[12] bg-zinc-50 px-3'>
        <View className='flex-row items-center gap-3 py-3'>
          <View className='rounded-[10] h-14 w-14 bg-orange-50 items-center justify-center'>
            <Ionicons name={typeIcon} size={22} color={color.morange} />
          </View>
          <View className='flex-1'>
            <Text className='text-[13px] font-[Nunito-bold] text-zinc-800' numberOfLines={1}>
              {booking.eventName ?? 'Service'}
            </Text>
            {!!booking.offerName && (
              <Text className='text-[11px] font-[Nunito-regular] text-zinc-400 mt-0.5' numberOfLines={1}>
                {booking.offerName}
              </Text>
            )}
            {!!booking.eventLocation && (
              <Text className='text-[11px] font-[Nunito-medium] text-zinc-500 mt-0.5' numberOfLines={1}>
                {booking.eventLocation}
              </Text>
            )}
          </View>
          {typeof booking.total === 'number' && (
            <Text className='text-[13px] font-[Nunito-bold]' style={{ color: color.moregreen }}>
              ₦{booking.total}
            </Text>
          )}
        </View>
      </View>

      {/* Total */}
      {typeof booking.total === 'number' && (
        <View className='flex-row justify-between items-center mt-3 pt-3 border-t border-zinc-200'>
          <Text className='text-[13px] font-[Nunito-semiBold] text-zinc-600'>Amount</Text>
          <Text className='text-[16px] font-[Nunito-bold]' style={{ color: color.moregreen }}>
            ₦{booking.total}
          </Text>
        </View>
      )}

      {/* Actions */}
      {(canPay || canCancel) && (
        <View className='flex-row gap-3 mt-4'>
          {canPay && (
            <View className='flex-1'>
              <CustomButton
                textStyle='text-[12px]'
                title={booking.status === 'pending_payment' ? 'Resume Payment' : 'Make Payment'}
                style='bg-green-500 w-full'
                onPress={() => onPay?.(booking)}
              />
            </View>
          )}
          { (
            <View className='flex-1'>
              <CustomButton
                textStyle='text-[12px]'
                title='Cancel'
                style='bg-red-600 w-full'
                onPress={() => onCancel?.(booking.$id)}
              />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default BookingCard