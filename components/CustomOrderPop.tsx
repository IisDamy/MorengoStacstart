import { useCartStore } from "@/store/cart.auth.store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { PopupWrapper } from ".";
import CustomInput from "./CustomInput";
import CustomButton from "./ui/CustomButton";
import LocationDropdown from "./LocationDropdown";
import { useCordsStore } from '@/store/coords.store'
import { router } from "expo-router";
import { color } from "@/constants";

interface CustomOrderPopProps {
  visible: boolean;
  onClose: () => void;
}

export default function CustomOrderPop({
  visible,
  onClose,
}: CustomOrderPopProps) {
  const { addItem } = useCartStore();
  const {locations} = useCordsStore()
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    name: "",
    id: "",
    price: 0,
    image: "",
    vendors: { name: "", id: "", locationDescription: "", coords: [] },
  });


  return (
    <PopupWrapper visible={visible} onClose={onClose}>
      <View className="gap-10 mt-5 px-4 mb-16">
        <Text className="mb-5 self-center font-[Crispy]">Custom order</Text>
        <CustomInput
          style="h-[50] "
          placeholder="Describe what you're looking for?"
          value={form.name}
          onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        />
        <CustomInput
          style=" h-[50]"
          placeholder="Where can we find it?"
          value={form.vendors.name}
          onChangeText={(text) =>
            setForm((prev) => ({
              ...prev,
              vendors: { ...prev.vendors, name: text },
            }))
          }
        />

        <View className="flex-row justify-between py-4 items-center  border-zinc-100 border-b w-full">
          <Text className="font-[Nunito-semiBold]">Quantity</Text>
          <View className="py-2 w-[100] items-center justify-around flex-row">
            <TouchableOpacity
              onPress={() => setQty((prev) => (prev > 1 ? prev - 1 : prev))}
            >
              <MaterialIcons name="remove-circle" size={24} color={color.moregreen} />
            </TouchableOpacity>
            <Text className="font-bold">{qty}</Text>
            <TouchableOpacity onPress={() => setQty((prev) => prev + 1)}>
              <MaterialIcons name="add-circle" size={24} color={color.moregreen} />
            </TouchableOpacity>
          </View>
        </View>
          <View>
              <Text className="mb-4 font-[Nunito-semiBold] ">Add delivery location</Text>
              <LocationDropdown locations={locations} onNavigate={()=> router.push('/location')}/>
          </View>
          
          

        <View className="flex-row items-center">
          <Text className=" w-[10%] text-2xl text-center  font-semibold">
            ₦
          </Text>
          <CustomInput
            style="h-[50] w-[40%]"
            placeholder="Add price"
            keyboardType="numeric"
          />
        </View>

        <CustomButton
          style={"bg-blue-300 mt-10"}
          title="Add to cart"
          onPress={() => addItem({ qty, item: {}, modifierOptions: [] })}
        />
      </View>
    </PopupWrapper>
  );
}
