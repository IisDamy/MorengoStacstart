import { CreateVendorLocation, LocationSideButton } from "@/components";
import AddLocation from "@/components/AddLocation";
import LocationMap from "@/components/LocationMap";
import { color } from "@/constants";
import  useActiveOrder  from "@/store/activeOrderStore";
import { useTrackRiderLocation } from "@/hooks/useTrackRider";
import { getVendors } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useCordsStore } from "@/store/coords.store";
import { MaterialIcons } from "@expo/vector-icons";
import {getCurrentLocation} from "@/lib/utils";
import { setAccessToken } from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

setAccessToken(null);

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const location = () => {
  const { user } = useAuthStore();
  const { locations, location } = useCordsStore();
  const [mapCoords, setMapCoords] = useState([4.55, 8.5]);
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveUserOpened, setIsSaveUserOpened] = useState(false);
  const [isSaveVendorOpened, setIsSaveVendorOpened] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const {activeOrder} = useActiveOrder()

  const searchTimeout = useRef(null);

  // RIDER TRACKING - if the customer has an order out for delivery, watch
  // the rider's live position and hand it to the map as `riderCoords`.
 
  const { riderCoords } = useTrackRiderLocation(
    activeOrder?.$id ??null,
    user.$id 
  );

  useEffect(()=>{
    console.log(riderCoords)
  },[riderCoords,'not'])

  useEffect(() => {
    console.log(activeOrder?.$id,riderCoords, 'ewfdp')
    initializeLocation();
    fetchVendors();

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [location]);

  /* 
     INITIAL ROUTING LOGIC
  */
  const initializeLocation = async () => {
    setIsLoading(true);
    
    try {
      if (location.coords) {
      
        setMapCoords(location.coords);
        return;
      
      } 

      if (!user?.institution || !location) {
        await goToUserLocation();
        return;
      }
            const url =
        `${NOMINATIM_BASE}/search` +
        `?q=${encodeURIComponent(user.institution)}` +
        `&format=json` +
        `&limit=1` +
        `&countrycodes=ng`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Morengo/1.0 (contact@myapp.com)",
          "Accept-Language": "en",
        },
      });

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        setMapCoords(coords);
      } else {
        console.warn("Institution not found on Nominatim, falling back to GPS");
        // await goToUserLocation();
      
     
        }
    }
    catch (error) {
      console.error("Institution location error:", error);
      await goToUserLocation();
    } finally {
      setIsLoading(false);
      }
  };

  

  const fetchVendors = async () => {
    try {
      const vendorsRes = await getVendors({});
      if (!vendorsRes) {
        throw new Error("No vendors found");
      }

      setVendors(vendorsRes);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  /* 
     USER GPS LOCATION
 */
  const goToUserLocation = async () => {
    setIsLoading(true);

    try {
    const coords = await getCurrentLocation();
      setMapCoords(coords);
    } catch (error) {
      console.error("Location error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* 
     SEARCH
  */
  const performSearch = async (text: string) => {
    try {
      const url =
        `${NOMINATIM_BASE}/search` +
        `?q=${encodeURIComponent(text)}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=3` +
        `&countrycodes=ng`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Morengo/1.0 (contact@myapp.com)",
          "Accept-Language": "en",
        },
      });
      const vendors = (await getVendors({ query: text })) || [];
      const notimSuggestions = await response.json();
      const vendorSuggestions = vendors.map((vendor) => {
        return {
          display_name: vendor.name,
          place_id: vendor.$id,
          lon: vendor.coords[0],
          lat: vendor.coords[1],
          isVendor: true,
        };
      });

      const data = [...notimSuggestions, ...vendorSuggestions];
      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSuggestions([]);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length < 1) {
      setSuggestions([]);
    } else {
      searchTimeout.current = setTimeout(() => {
        performSearch(text);
      }, 400);
    }
  };

  const handleSelectLocation = (item: any) => {
    const coords = [parseFloat(item.lon), parseFloat(item.lat)];

    setMapCoords(coords);
    setSearchText(item.display_name);
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <View className="flex-1 items-center">
      <LocationMap
        coords={mapCoords}
        vendors={vendors}
        loading={isLoading}
        riderCoords={riderCoords}
      />

      {/* Small banner while a rider is out for delivery */}
      {riderCoords && (
        <View className="w-[89%] absolute top-6 bg-white/90 rounded-2xl p-3">
          <Text className="font-[Nunito-bold] text-sm text-center">
            Your rider is on the way
          </Text>
        </View>
      )}

      {/* SEARCH */}
      <View className="w-full px-12 items-center  absolute top-16">
        <TextInput
          value={searchText}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full py-5 border border-zinc-800 text-black p-4 bg-white opacity-[86%] font-[Nunito-regular] rounded-full"
        />

        {!isFocused && (
          <MaterialIcons
            name="search"
            size={24}
            color="#c1c1c393"
            className={`mr-[2] top-[25%] left-16 absolute ${
              !searchText ? "opacity-1" : "opacity-0"
            }`}
          />
        )}

        {suggestions.length > 0 && (
          <View className="w-[89%] mx-auto top-[52] absolute bg-white mt-4 rounded-[15] overflow-hidden">
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={item.place_id ?? index}
                onPress={() => handleSelectLocation(item)}
                className="p-4 border-b flex-row border-zinc-100"
              >
                {" "}
                {item.isVendor && (
                  // <Image source={images.bag} tintColor={'red'}/>
                  <MaterialIcons
                    name="fastfood"
                    size={20}
                    color={color.morange}
                    className="mr-2"
                  />
                )}
                <Text numberOfLines={1} className="font-[Nunito-regular]">
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* SIDE BUTTONS */}
      <View className="absolute top-[35%] right-[30] items-center gap-10">
        <View>
          <LocationSideButton
            name="add"
            color="#FDBA74"
            onPress={() => {
              setIsSaveVendorOpened(false);
              setIsSaveUserOpened((prev) => !prev);
            }}
          />
          <AddLocation
            isOpened={isSaveUserOpened}
            type="Customer"
            coords={mapCoords}
          />
        </View>

        {!(user?.role === "customer") && (
          <View>
            <LocationSideButton
              name="add-location-alt"
              color="green"
              onPress={() => {
                setIsSaveUserOpened(false);
                setIsSaveVendorOpened((prev) => !prev);
              }}
            />
          </View>
        )}

        <LocationSideButton
          name="gps-fixed"
          color="red"
          onPress={goToUserLocation}
        />
      </View>

      <CreateVendorLocation coords={mapCoords} isOpened={isSaveVendorOpened} />

      {isLoading && (
        <ActivityIndicator
          className="top-[50%] absolute"
          size="large"
          color="#4386e3"
        />
      )}
    </View>
  );
};

export default location;