import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';



interface LocationSideButtonProps{
    name:string,
    onPress:() => void,
    color:string
}




const LocationSideButton = ({name, onPress, color}:LocationSideButtonProps) => {


      const scale = useSharedValue(1);
    
      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
      }));
    
      const animate = () => {
        scale.value = withSequence(
          withTiming(0.6, { duration: 50}), // scale down quickly
          withTiming(1, { duration: 50,  })    // scale back to original
        );
      };


  return (
    <View>
        <TouchableOpacity onPress={()=>{
            animate()
            onPress()
        }}>
          <Animated.View className={`rounded-full bg-${color}-300 justify-center items-center w-11 border-${color}-500 border-[2px] h-11 border`}
            style={[animatedStyle,[{
                backgroundColor:name==='add'?'#FDBA74':name==='add-location-alt'?'#6ee7b7':'#fca5a5',
                borderColor:name==='add'?'#f97316':name==='add-location-alt'?'#22C55E':'#EF4444'
            }]]}
          >
           {name==='add'?<Text className="text-3xl text-white font-[Nunito-bold]">+</Text>: 
                         <MaterialIcons
                            name={name}
                            color={'white'}
                            size={20}/>}
                        
          </Animated.View>
        </TouchableOpacity>

    </View>
  )
}

export default LocationSideButton