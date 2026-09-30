import { color } from "@/constants";
import { useCartStore } from "@/store/cart.auth.store";
import { useCordsStore } from "@/store/coords.store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { PopupWrapper } from ".";
import LocationDropdown from "./LocationDropdown";
import CustomButton from "./ui/CustomButton";
import CustomInput from "./ui/CustomInput";

interface CustomOrderPopProps {
  visible: boolean;
  onClose: () => void;
}

const SectionLabel = ({ children }) => (
  <Text className="mb-2 text-xs uppercase tracking-wider text-zinc-500 font-[Nunito-semiBold]">
    {children}
  </Text>
);

export default function CustomOrderPop({
  visible,
  onClose,
}: CustomOrderPopProps) {
  const { addItem } = useCartStore();
  const { locations } = useCordsStore();
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    name: "",
    id: "",
    price: 0,
    image: "",
    vendors: { name: "", id: "", locationDescription: "", coords: [] },
  });

  const canSubmit = form.name.trim().length > 0 && form.vendors.name.trim().length > 0;

  return (
    <PopupWrapper visible={visible} onClose={onClose}>
      <View className="px-5 pt-2 pb-14">
        {/* Header */}
        {/* <View className="items-center mb-6">
          <Text className="text-xl font-[Crispy] text-zinc-900">
            Custom order
          </Text>
          <Text className="mt-4 text-sm text-zinc-500 font-[Nunito-semiBold] text-center">
            Tell us what you need and we'll get it for you
          </Text>
        </View> */}

        {/* Item details */}
        <View className="mb-5 mt-2">
          <SectionLabel>What do you need?</SectionLabel>
          <CustomInput
            style="h-[50]"
            placeholder="Describe what you're looking for"
            value={form.name}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, name: text }))
            }
          />
        </View>

        <View className="mb-5">
          <SectionLabel>Where can we find it?</SectionLabel>
          <CustomInput
            style="h-[50]"
            placeholder="Store or vendor name"
            value={form.vendors.name}
            onChangeText={(text) =>
              setForm((prev) => ({
                ...prev,
                vendors: { ...prev.vendors, name: text },
              }))
            }
          />
        </View>

        {/* Price + Quantity side by side */}
        <View className="flex-row gap-4 mb-5">
          <View className="flex-1">
            <SectionLabel>Budget</SectionLabel>
            <View className="flex-row items-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 px-3 h-[50]">
              <Text className="text-lg font-semibold text-zinc-700 mr-2">₦</Text>
              <CustomInput
                style="flex-1  border-0 bg-zinc-50"
                placeholder="0.00"
                keyboardType="numeric"
                value={form.price ? String(form.price) : ""}
                onChangeText={(text) =>
                  setForm((prev) => ({
                    ...prev,
                    price: Number(text.replace(/[^0-9.]/g, "")) || 0,
                  }))
                }
              />
            </View>
          </View>

          <View>
            <SectionLabel>Quantity</SectionLabel>
            <View className="flex-row items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 h-[50] w-[130]">
              <TouchableOpacity
                hitSlop={8}
                disabled={qty <= 1}
                className={qty <= 1 ? "opacity-30" : ""}
                onPress={() => setQty((prev) => (prev > 1 ? prev - 1 : prev))}
              >
                <MaterialIcons
                  name="remove-circle"
                  size={26}
                  color={color.moregreen}
                />
              </TouchableOpacity>
              <Text className="text-base font-bold text-zinc-900">{qty}</Text>
              <TouchableOpacity
                hitSlop={8}
                onPress={() => setQty((prev) => prev + 1)}
              >
                <MaterialIcons
                  name="add-circle"
                  size={26}
                  color={color.moregreen}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delivery */}
        <View className="mb-8">
          <SectionLabel>Delivery location</SectionLabel>
          <LocationDropdown
            locations={locations}
            onNavigate={() => router.push("/location")}
          />
        </View>

        <CustomButton
          style={canSubmit ? "bg-green-600" : "bg-zinc-300"}
          title="Add to cart"
          disabled={!canSubmit}
          onPress={() => {
            addItem({ qty, item: form, modifierOptions: [] });
            onClose();
          }}
        />
      </View>
    </PopupWrapper>
  );
}