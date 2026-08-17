import { color, images } from "@/constants";
import { MaterialIcons } from "@expo/vector-icons";
import { Camera, MapView, MarkerView } from "@maplibre/maplibre-react-native";
import React, { useEffect } from "react";
import { Image, View } from "react-native";

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

type LocationMapProps = {
  coords: number[];
  vendors?: any[];
  loading?: boolean;
  zoomLevel?: number;
  /** Live rider position while an order is being delivered - omit/null to hide */
  riderCoords?: [number, number] | null;
};

const LocationMap = ({
  coords,
  vendors = [],
  loading = false,
  zoomLevel = 15,
  riderCoords = null,
}: LocationMapProps) => {

  useEffect(()=>{
    console.log(riderCoords)
  },[riderCoords])

  
  return (
    <MapView
      style={{ flex: 1, width: "100%" }}
      mapStyle={JSON.stringify(OSM_STYLE)}
      logoEnabled={false}
      compassEnabled={false}
    >
      <Camera zoomLevel={zoomLevel} centerCoordinate={coords} />

      {!loading && (
        <>
          <MarkerView coordinate={coords}>
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

          {riderCoords && (
            <MarkerView coordinate={riderCoords}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#4386e3",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#ffffff",
                }}
              >
                <MaterialIcons
                  name="delivery-dining"
                  size={20}
                  color="#ffffff"
                />
              </View>
            </MarkerView>
          )}
        </>
      )}
    </MapView>
  );
};

export default LocationMap;