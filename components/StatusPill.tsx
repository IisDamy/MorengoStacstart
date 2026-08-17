import { View, Text } from 'react-native'
import React from 'react'
import { color } from '@/constants'

const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FDF3E7', text: '#C9820A', label: 'Awaiting Rider' },
  accepted: { bg: '#E9F7EF', text: color.moregreen, label: 'Rider Connected' },
  paid: { bg: '#EAF1FF', text: '#2563EB', label: 'Confirmed' },
  in_transit: { bg: '#F0E9FF', text: '#7C3AED', label: 'In Transit' },
  delivered: { bg: '#E9F7EF', text: color.moregreen, label: 'Delivered' },
  cancelled: { bg: '#FBEAEA', text: '#DC2626', label: 'Cancelled' },
}

export const getStatusMeta = (status: string) => STATUS_META[status] ?? { bg: '#F3F4F6', text: '#6B7280', label: status }

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

export default StatusPill