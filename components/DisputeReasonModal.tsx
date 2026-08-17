import { View, Text, Modal } from 'react-native'
import React from 'react'
import { CustomButton, CustomInput } from '@/components'

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

export default DisputeReasonModal