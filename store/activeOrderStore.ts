import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ActiveOrder = {
  $id: string;
  status: string;
};

type RiderOpts = {
  name:string;
  lat:number;
  lng:number;
  price:number;
  time:number;
}
type ActiveOrderState = {
  activeOrder: ActiveOrder | null;
  riderOpts : RiderOpts[] | null;
  setRiderOpts: (opts: RiderOpts[]) => void
  setActiveOrder: (order: ActiveOrder) => void;
  clearActiveOrder: () => void;
  clearRiderOpts: () => void;
  updateActiveOrder: (updatedOrder: ActiveOrder) => void;
};

const useActiveOrderStore = create<ActiveOrderState>()(
  persist(
    (set) => ({
      activeOrder: null,
      riderOpts:null,

      setActiveOrder: (order) => {
        set({ activeOrder: order });
      },

      setRiderOpts: (opts) => {
        set({riderOpts: opts});
      },

      updateActiveOrder: (updatedOrder) => {
        set((state) => {
          if (!state.activeOrder) {
            return state;
          }

          if (state.activeOrder.$id !== updatedOrder.$id) {
            return state;
          }

          return {
            activeOrder: {
              ...state.activeOrder,
              status: updatedOrder.status,
            },
          };
        });
      },

      clearActiveOrder: () => {
        set({ activeOrder: null });
      },

      clearRiderOpts: () => {
        set({riderOpts: null})
      }
    }),
    {
      name: "active-order-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useActiveOrderStore;