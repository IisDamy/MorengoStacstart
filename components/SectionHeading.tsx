import { Text } from 'react-native'
import React from 'react'

const SectionHeading = ({ label }: { label: string }) => (
  <Text className='text-[12px] font-[Nunito-bold] uppercase text-zinc-400 mb-4'>{label}</Text>
)

export default SectionHeading