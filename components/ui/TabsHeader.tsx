import { View, Text, Pressable } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import React from 'react'
import { router } from 'expo-router'
import NotificationBell from './NotificationBell'
import Back from './Back'
import { color } from '@/constants'
interface TabsHeaderProps{
    tabName:string
}

const TabsHeader = ({tabName}:TabsHeaderProps) => {
  return (
     <View className='w-full    items-center flex-row mt-2 px-2 justify-between '>
              
                {/* view should show slight tint color when clicked, pressable effect */}      
        <Text className=' self-center  text-lg tracking-wider'
          style={{
            fontFamily:'Crispy', 
            }}>
          {tabName}
        </Text>
     
 
        <NotificationBell color1='black' color2='black'/>
        
      </View>
  )
}

export default TabsHeader