import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { tablesDB, appwriteConfig } from '../lib/appwrite';

export function usePushToken(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return

    async function register() {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') return;
      console.log(status)
      try{
              const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId:'3dc12c49-b89f-441d-9ccf-f8a1c87f0072'
      });

      console.log(token, 'wwww')

      await tablesDB.updateRow(
        {
        databaseId:appwriteConfig.databaseId, 
        tableId:'user', 
        rowId:userId, 
        data:{
        pushToken: token,
      }});

      console.log('registered')
      }
      catch(e){
        console.error(e)
      }
    }
    register();
   
  }, [userId]);
}