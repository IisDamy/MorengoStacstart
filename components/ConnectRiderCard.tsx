import { View, Text, Image } from 'react-native'
import React, { useEffect } from 'react'
import { animations, color, images } from '@/constants';
import {VideoView, useVideoPlayer} from 'expo-video'
import LottieView from 'lottie-react-native';

// convert to svg animation to minimize storage

const ConnectRiderCard = () => {


  const localVideoSource = require('@/assets/videos/connecting-rider.mp4');

  const player = useVideoPlayer({assetId:localVideoSource}, player => {
    player.loop = true;
    player.play();
  });
  
  return (
    <View className='w-screen h-[180] items-center self-center mt-6 flex-1 '>
      <View className='w-[180] border border-white h-[180] z-1  items-center justify-center overflow-hidden'>
        {/* convert to svg animation */}
        <VideoView player={player} className='  ' 
      nativeControls={false} 
      surfaceType="textureView"
      style={{ width: 1000, height: 1000, position:'relative', bottom:35 }}/>
      </View>
      <Text className='absolute text-orange-300 text-center  text-xs font-[Nunito-regular]   top-4
      ' 
      >Connecting to rider...</Text>   
   </View>
  )
}

export default ConnectRiderCard