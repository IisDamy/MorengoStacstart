// services/db.ts
// import { database } from './watermelonDB';
// import { Q } from '@nozbe/watermelondb';
// import Item from './models/Item';
import * as Location from 'expo-location';
import { Order } from '@/types'

// // 1. ADD ITEM
// export async function addItem(title: string, description: string) {
//   const newPost = await database.write(async () => {
//     await database.get<Item>('items').create(item => {
//       item.title = title;
//       item.description = description;
//       item.created_at = Date.now();
//     });
//   });
//   return newPost
// }

// // 2. GET ALL ITEMS
// export async function getAllItems() {
//   return await database.get<Item>('items').query().fetch();
// }

// // 3. GET ITEMS WHERE TITLE STARTS WITH TEXT
// export async function getItemsStartsWith(searchText: string) {
//   return await database.get('items').query(
//     Q.where('title', Q.like(`${searchText}%`))
//   ).fetch();
// }

// // 4. SEARCH ANYWHERE IN TITLE (contains)
// export async function searchItemsContains(searchText: string) {
//   return await database.get('items').query(
//     Q.where('title', Q.like(`%${searchText}%`))
//   ).fetch();
// }

// // 5. DELETE ITEM
// export async function deleteItem(itemId: string) {
//   await database.write(async () => {
//     const item = await database.get('items').find(itemId);
//     await item.destroyPermanently();
//   });
// }


export const getCurrentLocation = async () => {
  try{
        const { status } = await Location.getForegroundPermissionsAsync();
    
          if (status !== "granted") {
            const { status: newStatus } =
              await Location.requestForegroundPermissionsAsync();
    
            if (newStatus !== "granted") {
              console.error("Permission denied");
              return;
            }
          }
    
          const locationation = await Location.getCurrentPositionAsync({});
          const coords = [
            locationation.coords.longitude,
            locationation.coords.latitude,
          ];
          return coords;
  }
  catch(e){
    
    throw new Error("Failed to get current location: " + e.message);
  }
}



export const DISPUTE_WINDOW_MS = 30 * 1000

export const getDisputeTimeLeft = (order: Order) => {
  const reference = new Date(order.deliveredAt).getTime()
  return Math.max(0, DISPUTE_WINDOW_MS - (Date.now() - reference))
}

export const formatCountdown = (ms: number) => {
  const secs = Math.ceil(ms / 1000)
  return `0:${secs.toString().padStart(2, '0')}`
}


export const ACTIVE_TRACKING_STATUSES = ["paid","preparing","in_transit"];

export const TERMINAL_ORDER_STATUSES = ["delivered", "cancelled"];
 
export const shouldTrackRiderLocation = (
  orderStatus: string | null | undefined
) => {
  if (!orderStatus) return false;
  if (TERMINAL_ORDER_STATUSES.includes(orderStatus)) return false;
  return ACTIVE_TRACKING_STATUSES.includes(orderStatus);
};
 
