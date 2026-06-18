import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import LocationSelectorModal from "./LocationSelectorModal";
import {useCordsStore}from "@/store/coords.store";


const LocationDropdown = ({
  onSelect,
  onNavigate,
}: {
  locations: { coords: number[]; label: string }[];
  selected: string | null;
  onSelect: (label: string) => void;
  onNavigate: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const {locations, location} = useCordsStore()

  const isEmpty = locations.length < 1;
  // const selected = locations.find((loc) => loc.isCurrent)?.label || null;
  const handlePress = () => {
    if (isEmpty) {
      Alert.alert(
        "No locations saved",
        "You need to save a location before setting your store address.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Add location",
            onPress: onNavigate,
          },
        ]
      );

      return;
    }

    setOpen(true);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.75}
        className={`border rounded-2xl h-[52px] flex-row items-center px-4 justify-between ${
          isEmpty
            ? "bg-zinc-50 border-zinc-200"
            : "bg-zinc-100 border-zinc-200"
        }`}
      >
        <View className="flex-row items-center gap-2 flex-1">
          <Ionicons
            name="location-outline"
            size={16}
            color={
              isEmpty
                ? "#d4d4d8"
                : location
                ? "#f97316"
                : "#9ca3af"
            }
          />

          <Text
            className={`text-[14px] flex-1 font-[Nunito-regular] ${
              isEmpty
                ? "text-zinc-300"
                : location
                ? "text-zinc-800"
                : "text-zinc-400"
            }`}
            numberOfLines={1}
          >
            {isEmpty
              ? "No locations saved yet"
              : location?.label || "Select a location"}
          </Text>
        </View>

        {isEmpty ? (
          <View className="flex-row items-center gap-1">
            <Text className="text-[11px] text-orange-400 font-[Nunito-semibold]">
              Add first
            </Text>

            <Ionicons
              name="arrow-forward"
              size={13}
              color="#f97316"
            />
          </View>
        ) : (
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color="#9ca3af"
          />
        )}
      </TouchableOpacity>

      <LocationSelectorModal
        open={open}
        onClose={() => setOpen(false)}
        locations={locations}
        selected={location.label}
        onSelect={onSelect}
        onNavigate={onNavigate}
      />
    </View>
  );
};

export default LocationDropdown;