import React from "react";
import {
    Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  open: boolean;
  onClose: () => void;
  locations: {
    coords: number[];
    label: string;
    description: string;
  }[];
  selected: string | null;
  onSelect: (label: string) => void;
  onNavigate: () => void;
};




const LocationSelectorModal = ({
  open,
  onClose,
  locations,
  selected,
  onSelect,
  onNavigate,
}: Props) => {

    // if (!selected){
    //     Alert.alert(
    //       "No locations saved",
    //       "You need to save a location before setting your store address.")
    // }

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/40 justify-end"
      >
        <View className=" rounded-t-3xl px-5 pt-5 pb-14">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[17px] font-[Nunito-bold] text-zinc-800">
              Choose location
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={22}
                color="#71717a"
              />
            </TouchableOpacity>
          </View>

          { 
            locations.map((loc) => {
            const isActive = selected === loc.label;

            return (
              loc.coords && <TouchableOpacity
                key={loc.label}
                onPress={() => {
                  onSelect(loc.label);
                  onClose();
                }}
                className={`flex-row items-center gap-3 p-4 rounded-2xl mb-2 border ${
                  isActive
                    ? "bg-orange-50 border-orange-300"
                    : "bg-zinc-50 border-zinc-100"
                }`}
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isActive
                      ? "bg-orange-500"
                      : "bg-zinc-200"
                  }`}
                >
                  <Ionicons
                    name="location"
                    size={14}
                    color={
                      isActive ? "white" : "#71717a"
                    }
                  />
                </View>

                <Text
                  className={`flex-1 text-[14px] font-[Nunito-semibold] ${
                    isActive
                      ? "text-orange-600"
                      : "text-zinc-700"
                  }`}
                  numberOfLines={1}
                >
                  {loc.label || loc.description}
                </Text>

                {isActive && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#f97316"
                  />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => {
              onClose();
              onNavigate();
            }}
            className="flex-row items-center gap-2 mt-1 p-3 justify-center"
          >
            <Ionicons
              name="add-circle-outline"
              size={16}
              color="#f97316"
            />

            <Text className="text-[13px] text-orange-500 font-[Nunito-semibold]">
              Save a new location
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default LocationSelectorModal;