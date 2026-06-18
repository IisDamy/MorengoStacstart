import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Location, CoordsStore } from "@/types";


export const useCordsStore = create<CoordsStore>()(
persist( 
    (set, get) => ({
        locations: [],

        location: {},

       saveLocation: (loc: Location) => {
        const exists = get().locations.some(
          (item) =>
            item.label === loc.label ||
            (
              item.coords[0] === loc.coords[0] &&
              item.coords[1] === loc.coords[1]
            )
        );
        
        if(get().locations.length < 8 ){
            if (exists) {
          set({
            locations: get().locations.map((item) =>
              item.label === loc.label ||
              (
                item.coords[0] === loc.coords[0] &&
                item.coords[1] === loc.coords[1]
              )
                ? loc
                : item
            ),
          });
        } 
        else {
          set({
            locations: [...get().locations, loc],
          });
        }

        }
        
      },

      setCurrentLocation: (loc:Location) => {
        set({
          location: loc})},

   deleteLocation: (loc: Location) => {
  set({
    locations: get().locations.filter(
      item =>
        item.label !== loc.label ||
        item.coords[0] !== loc.coords[0] ||
        item.coords[1] !== loc.coords[1]
    ),
  });
},

    })
    ,
     {
    name: "vendor-coords",
    storage: createJSONStorage(() => AsyncStorage),
        }
)
)
  
