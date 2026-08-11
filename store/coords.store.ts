import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Location, CoordsStore } from "@/types";


export const useCordsStore = create<CoordsStore>()(
persist( 
    (set, get) => ({
        locations: [],

        location: {
          coords:null,
          description:'',
          label:''
        },

  saveLocation: (loc: Location) => {
  const locations = get().locations;
  loc = {...loc, label:loc.label || 'Home'}

  const existingIndex = locations.findIndex(
    (item) =>
      item.label === loc.label ||
      (
        item.coords[0] === loc.coords[0] &&
        item.coords[1] === loc.coords[1]
      )
  );

  get().setCurrentLocation(loc);
  // Location already exists → update it in place
  if (existingIndex !== -1) {
    set({
      locations: locations.map((item, index) =>
        index === existingIndex ? loc : item
      ),
    });

    return;
  }

  // New location
  set({
    locations: [...locations.slice(-7), loc],
  });

},

      setCurrentLocation: (loc:Location) => {
        set({
          location: {...loc, label:loc.label || 'Home'}})},



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

clearLocations: () => {
  set({
    locations: [],
    location: {
      coords: null,
      description: '',
      label: ''
    }
  });
}

    })
    ,
     {
    name: "vendor-coords",
    storage: createJSONStorage(() => AsyncStorage),
        }
)
)
  
