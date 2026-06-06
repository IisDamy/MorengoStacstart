import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { color } from '@/constants'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

import useAuthStore from '@/store/auth.store'
import { Location } from '@/types'
import { useCordsStore } from '@/store/coords.store'


interface AddLocationProps {
  isOpened: boolean
  coords: number[] | []
  type: 'Customer' | 'Vendor'
}


const AddLocation = ({ isOpened, coords }: AddLocationProps) => {

  const {saveLocation} = useCordsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [newLocation, setNewLocation] = useState({ label: 'Home', coords: coords } as Location)

  const inputRef = useRef(null)
  const scale = useSharedValue(0.5)
  const opacity = useSharedValue(0)


  // Fetch the existing Location row for this user on mount






  const handleAddLocation =  () => {
   saveLocation({...newLocation, coords})
    Alert.alert('Location saved successfully!')
 
  }


  useEffect(() => {
    if (isOpened) {
      inputRef.current?.focus()
      opacity.value = withTiming(1, { duration: 250 })
      scale.value = withTiming(1, { duration: 250 })
    } else {
      inputRef.current?.blur()
      opacity.value = withTiming(0, { duration: 200 })
      scale.value = withTiming(0.1, { duration: 200 })
    }
  }, [isOpened])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: 50 },
        { translateY: -50 },
        { scale: scale.value },
        { translateX: -50 },
        { translateY: 50 },
      ],
    }
  })

  return (
    <Animated.View
      style={animatedStyle}
      className="bg-white right-[45] top-[-25] rounded-[10] w-28 gap-3 p-2 h-fit absolute"
    >
      <TextInput
        ref={inputRef}
        className="bg-zinc-200 font-[Nunito-regular] border-zinc-400 p-2 text-sm rounded-[5] py-2 border"
        value={newLocation.label}
        maxLength={20}
        onChangeText={(text) => setNewLocation(prev => ({ ...prev, label: text }))}
      />

      <TouchableOpacity onPress={handleAddLocation} disabled={isLoading}>
        <Text
          className="p-2 rounded-[10] text-center font-[Nunito-bold] text-white"
          style={{ backgroundColor: isLoading ? '#aaa' : color.moregreen }}
        >
          Save
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default AddLocation
