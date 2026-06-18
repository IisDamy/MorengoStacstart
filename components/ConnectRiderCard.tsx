import { View, Text, Image } from 'react-native'
import React from 'react'
import { animations, color, images } from '@/constants';
import {VideoView, useVideoPlayer} from 'expo-video'

const ConnectRiderCard = () => {
  const player = useVideoPlayer(animations.connectingRider, player => {
    player.loop = true;
    player.play();
  });
  
  return (
    <View className='w-full h-[170px] border items-center self-center mt-12 flex-1 '>
      <VideoView className='w-full h-full' player={player}/>
    

   

    
   </View>
  )
}

export default ConnectRiderCard