import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { CustomButtonProps } from '@/types'
import { color } from '@/constants'



const CustomButton = (
    {
        onPress,
        title='Click Me',
        style,
        textStyle,
        leftIcon,
        disabled,
        isLoading=false
    }: CustomButtonProps
) => {
  return (
  <TouchableOpacity onPress={onPress} disabled={disabled}>
    {leftIcon}
    <View className={`flex items-center rounded-[10] py-4  p-2 ${style}`}
       
    >
        {isLoading? (
            <ActivityIndicator size={'small'} color={'white'}/>):(
                <Text className={`text-white  font-[Nunito-bold] tracking-wide ${textStyle}`} >
                    {title}
                </Text>
        )}
    </View>
    
  </TouchableOpacity>
  )
}

export default CustomButton