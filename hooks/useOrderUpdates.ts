import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';


export function useOrderUpdates( ) {
  const [data, setData] = useState({orderId:'', status:''});

  // Layer 1: push listener — instant update while app is open
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as {
        orderId: string;
        status: string;
      };
    //   if (data?.orderId === orderId) {
    console.log(data)
        setData(data);
    //   }
    });
    return () => sub.remove();
  }, []);




  return data;
}