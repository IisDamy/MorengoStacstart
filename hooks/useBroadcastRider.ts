import {  updateRiderLocation } from "@/lib/appwrite";
import {shouldTrackRiderLocation,} from '@/lib/utils'
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

type UseBroadcastRiderLocationOptions = {
  /** The delivery document's $id (not the order id) */
  deliveryId: string | null;
  /** Current order status - tracking turns on/off automatically from this */
  orderStatus: string | null;
  /** Minimum time between backend writes, ms. Default 4s. */
  minIntervalMs?: number;
  /** Minimum distance between backend writes, meters. Default 15m. */
  minDistanceM?: number;
};

export const useBroadcastRiderLocation = ({
  deliveryId,
  orderStatus,
  minIntervalMs = 4000,
  minDistanceM = 15,
}: UseBroadcastRiderLocationOptions) => {
  const [error, setError] = useState<unknown>(null);
  const [lastCoords, setLastCoords] = useState<[number, number] | null>(null);
  const subscription = useRef<Location.LocationSubscription | null>(null);

  const isActive = deliveryId != null && shouldTrackRiderLocation(orderStatus);

  useEffect(() => {
    let isMounted = true;

    const start = async () => {
      if (!deliveryId || !isActive) return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError(new Error("Location permission not granted"));
          return;
        }

        subscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: minIntervalMs,
            distanceInterval: minDistanceM,
          },
          async (position) => {
            if (!isMounted) return;

            const coords: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];

            setLastCoords(coords);

            try {
              await updateRiderLocation(deliveryId, coords);
            } catch (err) {
              setError(err);
            }
          }
        );
      } catch (err) {
        setError(err);
      }
    };

    start();

    return () => {
      isMounted = false;
      subscription.current?.remove();
      subscription.current = null;
    };
  }, [deliveryId, isActive, minIntervalMs, minDistanceM]);

  return { lastCoords, isActive, error };
};