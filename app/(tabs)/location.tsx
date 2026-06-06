import { CreateVendorLocation, LocationSideButton } from "@/components";
import AddLocation from "@/components/AddLocation";
import { color, images } from "@/constants";
import { getVendors } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useCordsStore } from "@/store/coords.store";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Camera,
  MapView,
  MarkerView,
  setAccessToken,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

setAccessToken(null);

// change image of store
const OSM_STYLE = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const location = () => {
  const { user } = useAuthStore();
  const cameraRef = useRef(null);
  const { locations, location } = useCordsStore();
  const [mapCoords, setMapCoords] = useState([4.55, 8.5]);
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveUserOpened, setIsSaveUserOpened] = useState(false);
  const [isSaveVendorOpened, setIsSaveVendorOpened] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);

  const searchTimeout = useRef(null);
const currentLoc = locations.find((loc) => loc.isCurrent);


  useEffect(() => {
    initializeLocation();
    fetchVendors();

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [currentLoc]);

  /* 
     INITIAL ROUTING LOGIC
  */
  const initializeLocation = async () => {
    setIsLoading(true);
    
    try {
      if (currentLoc) {
        console.log(currentLoc);
        setMapCoords(currentLoc.coords);
        return;
      } 

      if (!user?.institution || !currentLoc) {
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
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (newStatus !== "granted") {
          console.error("Permission denied");
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const coords = [
        currentLocation.coords.longitude,
        currentLocation.coords.latitude,
      ];

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
      <MapView
        style={{ flex: 1, width: "100%" }}
        mapStyle={JSON.stringify(OSM_STYLE)}
        logoEnabled={false}
        compassEnabled={false}
      >
        <Camera ref={cameraRef} zoomLevel={15} centerCoordinate={mapCoords} />

        {!isLoading && (
          <>
            <MarkerView coordinate={mapCoords}>
              <Image source={images.location} className="w-8 h-8" />
            </MarkerView>

            {vendors?.length > 0 &&
              vendors.map((vendor) => (
                <MarkerView key={vendor.$id} coordinate={vendor.coords}>
                  <MaterialIcons
                    name="storefront"
                    size={32}
                    color={color.moregreen}
                    className="self-center"
                  />
                </MarkerView>
              ))}
          </>
        )}
      </MapView>

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

        {!(user?.role === "Customer") && (
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
