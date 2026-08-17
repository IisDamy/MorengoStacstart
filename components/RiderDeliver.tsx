import LocationMap from "@/components/LocationMap";
import { useBroadcastRiderLocation } from "@/hooks/useBroadcastRider";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import useAuthStore from "@/store/auth.store";
import { setAccessToken } from "@maplibre/maplibre-react-native";
import { useLocalSearchParams } from "expo-router"; // swap for your router if different
import React from "react";
import { Text, View } from "react-native";

setAccessToken(null);

const RiderDeliverScreen = () => {
  const { user } = useAuthStore();
  // deliveryId is the $id of the delivery document, not the order id
  const { orderId, deliveryId, destLat, destLng, initialStatus } =
    useLocalSearchParams<{
      orderId: string;
      deliveryId: string;
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

  const { lastCoords, isActive, error } = useBroadcastRiderLocation({
    deliveryId: deliveryId ?? null,
    orderStatus,
  });

  return (
    <View className="flex-1">
      <LocationMap
        coords={lastCoords ?? destinationCoords}
        riderCoords={lastCoords}
        riderOnline={isActive}
      />

      <View className="absolute top-16 left-4 right-4 bg-white/90 rounded-2xl p-4">
        <Text className="font-[Nunito-bold] text-base">
          {isActive
            ? "Sharing your location with the customer"
            : `Not sharing location (order status: ${orderStatus ?? "unknown"})`}
        </Text>
      </View>

      {error != null && (
        <View className="absolute top-32 left-4 right-4 bg-red-50 rounded-2xl p-4">
          <Text className="font-[Nunito-regular] text-red-600 text-sm">
            Couldn't share your location. Check location permissions.
          </Text>
        </View>
      )}
    </View>
  );
};

export default RiderDeliverScreen;