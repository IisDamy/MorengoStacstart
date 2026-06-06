'use client'
import { View, Text,ScrollView,Image, TouchableOpacity, TextInput, } from 'react-native';
import React,{useEffect, useRef, useState} from 'react';
import { color, animations, images } from '@/constants';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  Easing,
  useScrollOffset,
  useAnimatedRef,
} from 'react-native-reanimated';
import { Redirect, router } from 'expo-router';
import LottieView from 'lottie-react-native';
import Tabs from 'expo-router';
import { Manifesto, } from '@/components';
import useAuthStore from '@/store/auth.store';
import Background from '@/components/ui/Background';

// SIGN IN POP UP ON PAGE OPEN if user aint signed in

// can replace touchable opacity with pressable if you want to style pressed effect
// also main body componenets are wrapped in pressable cos it supports long press, long press on app to open transition screen
// also main body components, animateed bulge, and light opacity text untop tellong user to hold icon to transition
// connect with us should close when user open's manifesto


const Dashboard = () => {

  const {isAuthenticated, user} = useAuthStore()

  const [isOpen, setIsOpen] = useState(false)
  const [sparkleFinish, setSparkleFinish] = useState(false)
  const [whatIs, toggleWhatIs] = useState(false)

  //reanimate
  const rotate = useSharedValue(0)
  const offset = useSharedValue(-150)
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const ScrollOffset = useScrollOffset(scrollRef)
  const smileyRef = useRef<LottieView>(null)
  const sparkleRef = useRef<LottieView>(null)
  

  const ConnectAnimatedStyles = useAnimatedStyle(() => ({
    display: offset.value === -150? 'none':'flex',
    transform: [{ translateY: offset.value }],
 

    
  }));

const openDashboard = () => {
  return toggleWhatIs(false)
}

const SmileyAnimatedStyles = useAnimatedStyle(()=>({
  transform:[{rotate: `${rotate.value}deg`}]
}))

  
  useEffect(()=>{
      const displayConnect = () => {
      if (isOpen) {
        
      offset.value = withTiming(0, {
        duration: 500,
        easing: Easing.inOut(Easing.poly(4))
      });

    } else {
      offset.value = withTiming(-150, {
        duration: 300,
        easing: Easing.inOut(Easing.poly(4))
      });

    }
  }
  return displayConnect()

  },[isOpen])

  // smiley
  useEffect(()=>{
    setTimeout(() => sparkleRef.current?.play(), 600)
  const interval = setInterval(()=>{
    rotate.value = withTiming(rotate.value + 360, {duration:1000})
    smileyRef.current?.play() 
  }, 30000)
    return () => clearInterval(interval)
  },[])



  return (
    <View className={`bg-[#57a886]  flex items-center   h-screen`}>
      <LinearGradient
      className='w-full absolute top-20 h-full'
      colors={ ['#57a886', color.morange]}/>
        {/* Image background */}
       {!whatIs?
        <View className='flex items-center '>
        <Background />
  
        {/* header 
          disapears when scroll down, 
          appears when scroll up
        
        */}
        <View className='flex px-6 py-4 w-full items-center  flex-row  justify-between'
          style={{
            backgroundColor:'rgba(255, 255, 255, 0)'
          }}
        >
          <View className='border  p-4 pr-8 rounded-2xl'
            style={{
              borderColor: color.dashboard,
      
            }}
          >
            
       
            <Text className=''
            style={{
              color: color.dashboard
            }}
            >Dashboard</Text>
          </View>
          <View >
            {/* turn to image with no letter spacing, fat text*/}
            <Text
            className='text-2xl'
            style={{
              fontFamily:'Crispy',
              color: color.morange,
              letterSpacing: 0,
              textShadowColor:'white',
              textShadowOffset:{width:0, height:1},
               textShadowRadius: 0.1,
            }} 
            >MORENGO</Text>
          </View>
      </View>

      {/* ScrollView */}
      <Animated.ScrollView className='
      px-6 
      '
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ref={scrollRef}
      >
        {/* If user loged in */}
      <Text
       className='w-full h-5 font-bold '
        style={{
          color:color.dashboard
        }}
      >Welcome {user?.name}</Text>
      <Text
      className='mb-12  pt-4'
        style={{
          color:color.dashboard,
          lineHeight:25
        }}
      >What can we do to make your day
      <TouchableOpacity onPress={()=>router.push('/(screens)/MoreDashboard')}>
        <Text
      className='text-green-400 relative top-1'
      > more
      </Text>
      </TouchableOpacity> 
     
        convenient?
        {/*still need to add smiley face */}
        </Text>
        {/* smiley */}
        <Animated.View
            className='w-fit h-fit'
           style={[{
             position:'absolute',
             top:50,
             left:70,
            },SmileyAnimatedStyles
          ]}
        >
          <LottieView
          ref={smileyRef}
          style={{
              width: 38, 
             height: 38,
          }}
          progress={1}
          autoPlay={true}
          loop={false}
          source={animations.smiley}
      
        />
        </Animated.View>
 

      {/* Body */}
      <View className=' w-full  h-64'
     
      >

        <View className='w-full h-full  flex justify-between flex-row'>
              <View className=' bg-white w-[60%]  rounded-2xl'
      style={{
        borderColor:color.dashboard
      }}
      >
        <Text>open morengo</Text>
      </View>


     <View className='flex w-[30%] flex-col h-full justify-between '>

         <TouchableOpacity className=' bg-white h-[40%] w-full  rounded-2xl'
      style={{
        borderColor:color.dashboard
      }}
      onPress={() => router.push('/CheckOrders')}
      >
        <Text>check orders</Text>
      </TouchableOpacity>


      <View className=' bg-white w-full h-[40%] rounded-2xl'
      style={{
        borderColor:color.dashboard
      }}
      >
        <Text></Text>
      </View>
     </View>


        </View>

      </View>


      {/* body end */}
   
      <View className=' mt-8  pt-12 pb-1 flex overflow-hidden justify-start  '
      style={{zIndex:3,

      }}
      > 
        {!sparkleFinish && <LottieView
        ref={sparkleRef}
        source={animations.sparkle}
        // Controlled by state
        // Loop when playing
        onAnimationFinish={() => setSparkleFinish(true)}
        loop={false}
        style={{
           width: 200, 
           height: 100, 
           position: 'absolute',
          left:60,
          top:55,
           zIndex:3
           
           }}/>}

        {/* only appears during animation then is removed silently */}
      {/* <Animated.View className={'h-fit w-full  absolute top-[-367px]'}
          style={[{},ConnectGradientAnimatedStyles]}
      >
    
                  <LinearGradient
                  className='w-full  h-screen'
                  colors={['#57a886', '#3b5998']}/>
                </Animated.View> */}
      <View className='gap-2  flex items-center'>
      <View className='w-[90%] bg-black h-[1px]'></View>
      <View className='w-[80%] bg-black h-[1px]'></View>
      <View className='w-[60%] bg-black h-[1px]'></View>
      <View className='w-[50%] bg-black h-[1px]'></View>
  
      </View>
          {/* connect section should enter into padding of this */}
         <View className='py-8 '>
          <TouchableOpacity onPress={()=> setIsOpen(!isOpen)}>
            <Text className='tracking-[5px] w-full text-center '>Connect with us</Text>
          </TouchableOpacity>  
      </View>
      </View>
  

      {/* Connect with us section {is hidden untill user presses connect with us}*/}
       <View className='border border-transparent overflow-hidden'>
                  {<Animated.View className='self-center  relative p-2  justify-center flex-row w-52 h-52'
                style={[{
                display:'none',
              

        },ConnectAnimatedStyles]}> 
      <View className='flex w-[50%] justify-center gap-2 h-full mr-1 '>
            <View className='bg-white  h-[50%] rounded-2xl'></View>
            <View className='bg-white  h-[50%] rounded-2xl'></View>
        </View>
          <View className='flex w-[50%] justify-center gap-2 h-full ml-1'>
            <View className='bg-white h-[50%] rounded-2xl'></View>
            <View className='bg-white h-[50%] rounded-2xl'></View>
        </View>

      </Animated.View>}
      </View>


      {/* About us */}

      <View className='mt-20  h-fit mb-48'>
        <View className='w-[90%] mb-8 bg-black  mx-auto h-[1px]'></View>
          <TouchableOpacity className=' pt-1 '
             onPress={() => toggleWhatIs(true)}
          
          >
              <Text className='text-center  mb-4'>What is Morengo?</Text>
          </TouchableOpacity>
          
          {/* text is hidden, activated by clicking question */}
          <Text className='text-center'>
          </Text>
      </View>
      </Animated.ScrollView>

      {/* tab */}
      <View className=' w-72 h-20 flex-row absolute flex justify-around items-center bottom-20'>
        <TouchableOpacity onPress={()=> router.replace('/(tabs)')}>
          <View className='border flex items-center justify-center rounded-full w-14 bg-transparent h-14'
             style={{
              backgroundColor:'#fc73236e',
          
            }}
          >
              <Image 
              source={images.morengologo}
              resizeMode='contain'
            className='w-8 h-8 '
            tintColor={'#000000'}

      
          />
          </View>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => router.push('/(screens)/DashboardAid')}
          >
                   <View className='  w-32  h-16 '
            style={{
              backgroundColor:'#caafafc4',
              borderRadius: 18
            }}
          >
            <Text className='text-xl my-auto text-center '>...</Text>
          </View>
         
          </TouchableOpacity>

     
              {/* image is blurry, download larger format */}
               <View className='border flex items-center justify-center rounded-full w-14  h-14'
            style={{
              backgroundColor:'#fc73236e'
            }}>    
                  <Image
                source={images.profile}
                  resizeMode='contain'
                  className='w-6 h-6 '
                  tintColor={'#000000'}
              />

           </View>
         
          </View>
      
      </View> : <Manifesto
        whatIs={whatIs}
        openDashboard={openDashboard}
                // props
                // togglewhatis and whatis
      />
      }
      
 
    </View>
  
  )
}

export default Dashboard