import { View, Text,FlatList, Pressable, TouchableOpacity, Image, Alert } from 'react-native'
import React,{useEffect, useState} from 'react'
import { color } from '@/constants'
import { NotificationBell, TabsHeader, ToggleButton } from '@/components'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { ScrollView } from 'react-native'
import { useTabBarVisibility } from '@/contexts/TabBarVisibilityContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { signOut, updateUser, displayImage } from '@/lib/appwrite'
import useAuthStore from '@/store/auth.store'
import useNotificationStore from '@/store/notification.store'

const Profile = () => {
  const {user} = useAuthStore()
  const { onScroll } = useTabBarVisibility();
    const [enablePromoNotifs, setEnablePromoNotifs] = useState(true);
    const [enableNotifs, setEnableNotifs] = useState(true);
    const { addMsg, msgs } = useNotificationStore()

    const toggleSwitchNotifs = () => setEnableNotifs(previousState => !previousState);
    const toggleSwitchPromo = () => {
      setEnablePromoNotifs(prev => !prev)
      addMsg({text: 'Order has been delivered', type:'success'})
      console.log(msgs)
    }

  const LogOff = async () => {
  try{
    await signOut()
    router.replace('/(auth)/sign-in')
  }
  catch(e){
    
  }
  }

  const image = displayImage(user?.avatar).toString()




  return (
    <SafeAreaView>
        <ScrollView
    onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
  >
      <View className='profile items-center px-6  h-fit'

    >
    <TabsHeader tabName='Profile'/>
          <Image source={{uri:image}} alt='nope' className='w-32 h-24 mt-6 mb-6 border rounded-full'/>
      <View className=' w-full px-10 flex-row justify-between mb-6 flex items-center'>
        <View className='flex items-center'>
          <View className='rounded-full w-12 h-12 bg-black border'></View>
          <Text className='text-xs font-[Nunito-regular] mt-2'>History</Text>
        </View>
         <View className='flex items-center'>
          <View className='rounded-full w-12 h-14 bg-black border'></View>
          <Text className='text-xs font-[Nunito-regular] mt-2 w-[50] text-center'>Check points</Text>
        </View>

        <TouchableOpacity className='flex items-center' onPress={()=> user?.role === 'customer'? Alert.alert('You need be a store owner or morengo rider inorder to access dashboard') : router.push('/Dashboard')}>
          <View className='rounded-full w-12 h-12 border bg-black'></View>
          <Text className='text-xs font-[Nunito-regular] mt-2 w-[50] text-center'>Open dashboard</Text>
        </TouchableOpacity>
        

      </View>
      
      {/*maybe use flatlist for this, i thoink flatlist allows you to add headers */}
      <View className=' bg-white rounded-[10] h-fit p-6 w-full gap-12'>
        <View className=''>
          <Text className='font-[Nunito-bold] text-xl mb-2'
            style={{color:color.moregreen}}
          >My account</Text>
       <TouchableOpacity onPress={()=>router.push('/(screens)/ProfileEdit')}>
           <View className='flex-row justify-between border-b py-5 border-zinc-300'>
        <Text className='font-[Nunito-regular]'>Manage Profile</Text>
        <MaterialIcons name='keyboard-arrow-right' size={20} color={'#C2C2CB'}/>
       </View>
       </TouchableOpacity>

       <TouchableOpacity>
          <View className='flex-row justify-between border-b py-5 border-zinc-300'>
          <Text className='font-[Nunito-regular]'>Payment</Text>
          <MaterialIcons name='keyboard-arrow-right' size={20} color={'#C2C2CB'}/>
       </View>
       </TouchableOpacity>
    

        </View>


        <View className=''>
             <Text className='text-xl font-[Nunito-bold] mb-2 '
              style={{color:color.moregreen}}
             >Notifications
             </Text>

        <Pressable onPress={toggleSwitchNotifs}>
          <View className='border-b py-5 justify-between items-center flex-row border-zinc-300'>
          <Text className='font-[Nunito-regular]'>Notification</Text>
          <ToggleButton isEnabled={enableNotifs} toggleSwitch={toggleSwitchNotifs}/>
       </View>
        </Pressable>   
       
       <Pressable onPress={toggleSwitchPromo}>
        <View className='border-b py-5 justify-between items-center flex-row border-zinc-300'>
        <Text className='font-[Nunito-regular]'>Promotional Notification</Text>
        <ToggleButton isEnabled={enablePromoNotifs} toggleSwitch={toggleSwitchPromo}/>
        </View>
       </Pressable>

        </View>


        <View className=''>
             <Text className='text-xl font-[Nunito-bold] mb-2'
              style={{color:color.moregreen}}
             >More
             </Text>
        <TouchableOpacity>
          <View className='border-b flex-row justify-between py-5 border-zinc-300'>
            <Text className='font-[Nunito-regular]'>Contact us</Text>
            <MaterialIcons name='keyboard-arrow-right' size={20} color={'#C2C2CB'}/>
          </View>
        </TouchableOpacity>
       
       <TouchableOpacity>
        <View className='border-b flex-row justify-between py-5 border-zinc-300'>
          <Text className='font-[Nunito-regular]'>Share morengo</Text>
          <MaterialIcons name='keyboard-arrow-right' size={20} color={'#C2C2CB'}/>
      </View>
       </TouchableOpacity>


   
        </View>
      {/* logout */}
     
        <TouchableOpacity onPress={LogOff}>
          <Text className='font-black p-1 mt-0  mr-4 text-red-600 self-end'>Log Out</Text>
        </TouchableOpacity>
      
       
      
      </View>
    </View>
  </ScrollView>
    </SafeAreaView>
  
  )
}

export default Profile