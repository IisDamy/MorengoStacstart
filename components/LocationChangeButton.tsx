import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from "react-native-reanimated";
import useAuthStore from '@/store/auth.store';
import { account, getUserAddresses, updateUserAddress } from '@/lib/appwrite';
import { useCordsStore } from '@/store/coords.store';
import { Location } from '@/types';


const LocationChangeButton = () => {
  const { user } = useAuthStore()
  const {saveLocation, locations} = useCordsStore()

  const [defaultLocation, setDefaultLocation] = useState({})
  const [open, toggleOpen] = useState(false)

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);


  

  const changeLocation = async (location:Location) => {
try{
    setDefaultLocation(location) 
    handleToggle();
}
catch(e:any){
  console.error('Failed to update address:', e.message)
}
   
  };

  const handleToggle = () => {
    const newState = !open;
    toggleOpen(newState);
    scale.value = withTiming(newState ? 1 : 0, { duration: 220 });
    opacity.value = withTiming(newState ? 1 : 0, { duration: 180 });
  };

  const animatedDropdownStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleY: scale.value }],
      opacity: opacity.value
    };
  });

  return (
    <>
      <Pressable onPress={handleToggle}>
        <View className="flex flex-row items-center">
          <Ionicons
            name="location-outline"
            size={16}
            color="white"
          />

          <Text className="text-center font-[Nunito-bold] max-w-[50] ml-[3] text-[12px] text-green-100"
      
          >
            {defaultLocation.label || "Delivery Address"}
          </Text>

          <MaterialIcons
            name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={15}
            color={"#DCFCE7"}
            className="relative top-[2]"
          />
        </View>
      </Pressable>

      {locations.length > 0? <Animated.View
        style={[animatedDropdownStyle, { transformOrigin: "top" }]}
        className='absolute border border-t-[0] rounded-b-[5] px-2 left-[6] bg-green-100 top-[32]'
      >
        {locations.map((item) => (
          <Pressable
            key={item.$id || item.label}
            onPress={() => changeLocation(item)}
          >
            <Text className='border-b px-2 py-1 border-white text-sm'>
              {item.label}
            </Text>
          </Pressable>
        ))
     
      }
      </Animated.View>:
      
        <Animated.Text style={[animatedDropdownStyle, { transformOrigin: "top" }]}
        className='absolute text-sm left-[14] w-[75] top-[32]'>
          {'<'}No saved addresses{'>'}
          </Animated.Text>}
    </>
  )
}

export default LocationChangeButton;