import { getCurrentUser } from "@/lib/appwrite";
import { User } from "@/types";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";


type NotificationState = {
 msgs: {
    text:string,
    type:string,
    id:string
 }[] | [],
 clearMsgs: () => void;
 removeMsg: (id: string) => void;
 addMsg: (msg: any) => void;

};

const useNotificationStore = create<NotificationState>()(
  persist(
     (set, get) => ({
    msgs: [],
    clearMsgs: () => set({ msgs: [] }),
    addMsg: (msg) => set({ msgs: [...get().msgs, {...msg, id: Date.now().toString()}] }),
     removeMsg: (id) => {
        set({
            msgs: get().msgs.filter(
                (i) =>
                    !(
                        i.id === id 
                    )
            ),
        });
    },

}),
{
  name:'notifications',
  storage: createJSONStorage(()=> AsyncStorage)

}
  )
 );

export default useNotificationStore;
