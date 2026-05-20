import { View, Text, TouchableOpacity } from 'react-native'
import React,{useEffect, useState} from 'react'
import { getAllOrders, acceptOrder } from '@/lib/appwrite'
import { Order } from '@/types'
import useAuthStore from '@/store/auth.store'
import { SafeAreaView } from 'react-native-safe-area-context'

const CheckOrders = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)
    const {user} = useAuthStore()

    const handleAccept = async (orderId:string) => {
           await acceptOrder(orderId, user?.$id)     
    }

      const getOrders = async () => {
        setLoading(true)
        try {
          const ordersRes = await getAllOrders()
          setOrders(ordersRes)
          console.log(ordersRes)
        } catch (error) {
          console.error('Error fetching orders:', error)
        } finally {
          setLoading(false)
        }
      }
    
      useEffect(() => {

          getOrders()
        
      }, [])


  return (
    <SafeAreaView>
      <Text>CheckOrders</Text>
      {orders.map((order) => 
        order.items.map(
        (item) => {

           return (<View className='p-4 border'>
                    <TouchableOpacity onPress={() => handleAccept(order.$id)}>
                        <Text className=''>{item.name}</Text>
                    </TouchableOpacity>
                    
                    </View>
           )
        }
      ))
      }
    </SafeAreaView>
  )
}

export default CheckOrders