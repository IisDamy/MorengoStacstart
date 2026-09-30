import * as Location from "expo-location";
import { useCallback, useState } from "react";
import { useCordsStore } from "@/store/coords.store";

type Coords = number[];

export const useCurrentLocation = () => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {saveLocation} = useCordsStore()

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (newStatus !== "granted") {
          setError("Permission denied");
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({});
      const nextCoords: Coords = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      setCoords(nextCoords);
      saveLocation({coords:nextCoords})
      return nextCoords;
    } catch (e: any) {
      const message = "Failed to get current location: " + e.message;
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { coords, isLoading, error, getCurrentLocation };
};