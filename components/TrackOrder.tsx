import LocationMap from "@/components/LocationMap";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { useTrackRiderLocation } from "@/hooks/useTrackRider";
import useAuthStore from "@/store/auth.store";
import { setAccessToken } from "@maplibre/maplibre-react-native";
import { useLocalSearchParams } from "expo-router"; // swap for your router if different
import React from "react";
import { Text, View } from "react-native";

setAccessToken(null);

const TrackOrderScreen = () => {
  const { user } = useAuthStore();
  const { orderId, destLat, destLng, initialStatus } = useLocalSearchParams<{
    orderId: string;
    destLat: string;
    destLng: string;
    initialStatus: string;
  }>();

  const destinationCoords: [number, number] = [
    parseFloat(destLng ?? "0"),
    parseFloat(destLat ?? "0"),
  ];

  const orderStatus = useOrderStatus(
    orderId ?? null,
    user?.$id ?? null,
    initialStatus ?? null
  );

  const { riderCoords, lastUpdatedAt } = useTrackRiderLocation(
    orderId ?? null,
    user?.$id ?? null
  );

  const statusLabel =
    orderStatus === "delivered"
      ? "Delivered"
      : orderStatus === "cancelled"
      ? "Order cancelled"
      : riderCoords
      ? "Your rider is on the way"
      : "Waiting for a rider to start delivery...";

  return (
    <View className="flex-1">
      <LocationMap
        coords={riderCoords ?? destinationCoords}
        riderCoords={riderCoords}
        riderOnline={!!riderCoords}
      />

      <View className="absolute top-16 left-4 right-4 bg-white/90 rounded-2xl p-4">
        <Text className="font-[Nunito-bold] text-base">{statusLabel}</Text>
        {lastUpdatedAt && (
          <Text className="font-[Nunito-regular] text-xs text-zinc-500 mt-1">
            Last updated {new Date(lastUpdatedAt).toLocaleTimeString()}
          </Text>
        )}
      </View>
    </View>
  );
};

export default TrackOrderScreen;