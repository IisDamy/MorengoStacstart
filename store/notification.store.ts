import { getCurrentUser } from "@/lib/appwrite";
import { User } from "@/types";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";


type NotificationState = {
 msgs: {
    text:string,
    type:string
 }[] | [],
 clearMsgs: () => void;
 addMsg: (msg: any) => void;

};

const useNotificationStore = create<NotificationState>()(
  persist(
     (set, get) => ({
    msgs: [{text: 'Order has been delivered', type:'success'},{text:'New order received', type:'info'},{text:'Order has been cancelled', type:'error'}, {text:'Order is out for delivery', type:'warning'}],
    clearMsgs: () => set({ msgs: [] }),
    addMsg: (msg) => set({ msgs: [...get().msgs, msg] }),

}),
{
  name:'notifications',
  storage: createJSONStorage(()=> AsyncStorage)

}
  )
 );

export default useNotificationStore;
