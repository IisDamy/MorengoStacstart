import { Redirect, Slot } from 'expo-router'
import React, { useEffect } from 'react'
import { Dimensions, KeyboardAvoidingView, Platform, Text, View, ImageBackground, Image, Button, ScrollView } from 'react-native'
import { router } from 'expo-router'
import {images} from '../../constants/index'
import Sentry from '@sentry/react-native'
import useAuthStore from '@/store/auth.store'
import { SafeAreaView } from 'react-native-safe-area-context'
import { refreshAuthStore } from '@/lib/appwrite'


const AuthLayout = () => {
  // const {isAuthenticated} = useAuthStore()
  const { isAuthenticated, user, isLoading, fetchAuthenticatedUser } = useAuthStore();

  // useEffect(() => {
  //   const initialize = async () =>{
  //     try {
  //        await refreshAuthStore();
      
  //     } catch (error) {
  //       console.error('Error initializing auth store:', error);
  //       Sentry.captureException(error);
  //     }
  //   }

  //   initialize();
  // }, []);


  if (user?.role !== 'customer' && isAuthenticated) return <Redirect href='/(screens)/Dashboard' />
  if(isAuthenticated && !isLoading) return <Redirect href='/(tabs)' />
  
  return (
 
    <KeyboardAvoidingView behavior={ 'padding' } style={{flex:1}} className='bg-white'>
        <ScrollView keyboardShouldPersistTaps='handled' className=''>
        <View style={{height: Dimensions.get('screen').height/2.25}} className='bg-white'>   
            <ImageBackground source={images.loginGraphic} className='size-full rounded-b-lg'/>
            <Image source={images.morengologo}  className="self-center size-24 absolute bottom-0 z-10" />
        </View>
        <Slot />
    </ScrollView> 
    </KeyboardAvoidingView>
   
   
  )
}

export default AuthLayout