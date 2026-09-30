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
import { color as colore } from '@/constants';


interface LocationSideButtonProps{
    name:string,
    onPress:() => void,
    color:string,
    textf: string
}




const LocationSideButton = ({name, onPress, color, textf}:LocationSideButtonProps) => {


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
          <Animated.View className={`rounded-full bg-${color}-300 justify-center items-center  border-${color}-500 border-[1px]  border`}
            style={[animatedStyle,[{
                backgroundColor:name==='add'?'#a5e0a9':name==='add-location-alt'?'#cbe76e':'#abd6e4',
                borderColor:colore.morange
            }]]}
          >
           
           {name==='add'?<View className='flex-row items-center justify-center gap-2 h-12 w-32'>
            <Text className='text-xs text-zinc-500 font-[Nunito-regular]'>Add new location</Text>
            <Text className="text-2xl text-white font-[Nunito-bold]">+</Text>
           </View>: 
           <View className='flex-row items-center gap-2 h-12 justify-center w-32'>
            <Text className='text-xs text-zinc-500 font-[Nunito-regular]'>{textf}</Text>
             <MaterialIcons
                            name={name}
                            color={'white'}
                            size={20}/>
           </View>
                        }
                        
                        
          </Animated.View>
        </TouchableOpacity>

    </View>
  )
}

export default LocationSideButton