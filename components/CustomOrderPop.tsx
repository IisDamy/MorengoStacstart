import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { PopupWrapper } from '.'
import { useCartStore } from '@/store/cart.auth.store'
import CustomButton from './CustomButton'
import CustomInput from './CustomInput'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

interface CustomOrderPopProps {
    visible:boolean,
    onClose: () => void
}

export default function CustomOrderPop(
    {visible,
    onClose
    }:CustomOrderPopProps
) {

  const {addItem} = useCartStore()
  const [addLocation, toggleAddLocation] = useState(false)
  const [item, setItem] = useState({})
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({name:'', id:'',price:0, image:"", vendors:{name:'', id:'', locationDescription:'', coords:[]}})

  useEffect(()=>{
    toggleAddLocation(false)
  },[visible])




  return (
    <PopupWrapper visible={visible} onClose={onClose}> 
    
    <View className='gap-7 mt-5 px-4 mb-16'>
    <Text className='mb-5 self-center font-[Crispy]'>Custom order</Text>
    <CustomInput style='h-[50] ' placeholder='What are you looking for?' value={form.name} onChangeText={(text) => setForm(prev => ({...prev, name:text}))}/>
    <CustomInput style=' h-[50]' placeholder='Where can we find it?' value={form.vendors.name} onChangeText={(text) => setForm(prev => ({...prev, vendors:{...prev.vendors, name:text,}}))}/>

    <View className='flex-row justify-between py-4 items-center border-zinc-100 border-b w-full' >
        <Text>Quantity</Text>
        <View className='py-2 w-[100] items-center justify-around flex-row'>
            <TouchableOpacity onPress={() => setQty(prev => prev > 1 ? prev - 1 : prev)}>
                <MaterialIcons name='remove-circle' size={24} color={'green'} />
            </TouchableOpacity>
          <Text className='font-bold'>{qty}</Text>
          <TouchableOpacity onPress={() => setQty(prev => prev + 1)}>
            <MaterialIcons name='add-circle' size={24} color={'green'} />
          </TouchableOpacity>
        </View>
      </View>


    <View>
      <TouchableOpacity className='  flex-row gap-2'
        onPress={()=> toggleAddLocation(prev => !prev)}
      >
          <Text className='text-white font-bold w-[22] h-[22] text-center h-fit border-[2px] border-green-600 bg-blue-200 rounded-[5]'>+</Text>
          <Text className='font-bold text-zinc-600 text-lg'> Add location</Text>
      </TouchableOpacity>          
     {addLocation && 
     <View className='mx-10  mt-4 gap-4'>
          <View>
            <Text className='text-lg '>Describe location</Text>
            <CustomInput style='h-[70] mt-2 mx-2 ml-4' 
            multiline 
            value={form.vendors.locationDescription} 
            
            onChangeText={(text) => setForm(prev => ({...prev, vendors:{...prev.vendors, locationDescription:text,}}))}/>
          </View>  

          <Text className='self-center my-2 font-bold text-zinc-600'>OR</Text>
          <TouchableOpacity className='flex-row gap-2 items-center '>
            <Text className='text-lg font-bold text-zinc-600'>Show us on map</Text>
            <MaterialIcons name='arrow-forward' size={30} color={'lime'} />
          </TouchableOpacity>       
      </View>}
    <View/>
      </View>

    <View className='flex-row items-center'>
      <Text className=' w-[10%] text-2xl text-center  font-semibold'>₦</Text>
      <CustomInput style='h-[50] w-[40%]' placeholder='+ Add cost' keyboardType='numeric'/>
    </View>


     <CustomButton style={'bg-blue-300 mt-10'} title='Add to cart' onPress={() => addItem({qty, item:{}, modifierOptions:[]})}/>
    </View>
   
    </PopupWrapper>

  )
}