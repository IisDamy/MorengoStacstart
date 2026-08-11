import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { color } from '@/constants'

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

export default StagePill
