import { color } from "@/constants";
import { buildOrderString, formatNaira } from "@/constants/utils";
import { getModifierOptions } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.auth.store";
import { ModifierOptions } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    type ViewStyle,
} from "react-native";
import PopUpWrapper from "./PopUpWrapper";
import CustomButton from "./ui/CustomButton";
import CustomInput from "./ui/CustomInput";

interface SelectedItem {
  name: string;
  price: number;
  image: string;
  vendors: any;
  id: string | null;
}

interface MenuItemCartAddPopUpProps {
  visible: boolean;
  onClose: () => void;
  sheetStyle?: ViewStyle;
  selectedItem: SelectedItem | null;
}

interface SelectedModifier {
  $id: string;
  name: string;
  qty: number;
  price: number;
}

const MenuItemCartAddPopUp: React.FC<MenuItemCartAddPopUpProps> = ({
  visible,
  onClose,
  selectedItem,
  sheetStyle,
}) => {
  const { addItem } = useCartStore();

  const [qty, setQty] = useState(1);
  const [addSpecialInstructions, toggleAddSpecialInstructions] =
    useState(false);
  const [openSides, toggleOpenSides] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<
    SelectedModifier[]
  >([]);
  const [modifierOptions, setModifierOptions] = useState<ModifierOptions[]>([]);
  const [specialInstruction, setSpecialInstruction] = useState("");

  useEffect(() => {
    const handleOpen = async () => {
      toggleOpenSides(false);
      toggleAddSpecialInstructions(false);
      setSpecialInstruction("");
      setQty(1);
      setSelectedModifiers([]);
      await handleModifierOptions(selectedItem?.vendors?.$id);
    };
    handleOpen();
  }, [selectedItem?.id, visible]);

  const handleModifierPress = (option: {
    $id: string;
    name: string;
    price: number;
  }) => {
    setSelectedModifiers((prev) => {
      const existing = prev.find((m) => m.$id === option.$id);
      if (existing) {
        // Already selected — bump the quantity
        return prev.map((m) =>
          m.$id === option.$id ? { ...m, qty: m.qty + 1 } : m,
        );
      }
      // New modifier — add with qty 1
      return [...prev, { ...option, qty: 1 }];
    });
  };

  const handleModifierOptions = async (vendorId: string) => {
    try {
      const res = await getModifierOptions({ query: vendorId });
      const options = res.map((opt) => ({
        $id: opt.$id,
        name: opt.name,
        price: opt.price,
      }));
      if (!res) throw new Error("No modifier options found for this item");
      setModifierOptions(options);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PopUpWrapper visible={visible} onClose={onClose} sheetStyle={sheetStyle}>
      <View className="flex-row w-full border-b border-zinc-100 py-4 gap-8">
        <Image
          source={{ uri: selectedItem?.image }}
          className="w-32 h-28 rounded rounded-3xl"
        />
        <View className="gap-1">
          <Text className="font-[Nunito-bold] uppercase w-[185] flex-wrap ">
            {buildOrderString(selectedItem, selectedModifiers)}
          </Text>
          <Text className="font-[Nunito-bold] text-green-400">
            {selectedItem?.vendors?.name}
          </Text>
          <Text className="mt-2 font-[Nunito-medium]">
            Price: {formatNaira(selectedItem?.price)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between py-4 items-center border-zinc-100 border-b w-full">
        <Text className="font-[Nunito-semiBold]">Quantity</Text>
        <View className="py-2 w-[100] items-center justify-around flex-row">
          <TouchableOpacity
            onPress={() => setQty((prev) => (prev > 1 ? prev - 1 : prev))}
          >
            <MaterialIcons
              name="remove-circle"
              size={24}
              color={color.moregreen}
            />
          </TouchableOpacity>
          <Text className="font-[Nunito-bold]">{qty}</Text>
          <TouchableOpacity onPress={() => setQty((prev) => prev + 1)}>
            <MaterialIcons
              name="add-circle"
              size={24}
              color={color.moregreen}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="border-b border-zinc-100 py-4">
        <TouchableOpacity
          className="flex-row gap-2 mb-2 items-center"
          onPress={() => toggleOpenSides(!openSides)}
        >
          <MaterialIcons name="add-circle" size={24} color={color.moregreen} />
          <Text className="font-[Nunito-regular]">Add sides and beverages</Text>
        </TouchableOpacity>

        {openSides && (
          <View className="flex-wrap px-12 mt-4 flex-row gap-2">
            {modifierOptions?.map((option) => {
              // Find if this modifier is already selected so we can show its qty
              const selected = selectedModifiers.find(
                (m) => m.$id === option.$id,
              );
              return (
                <TouchableOpacity
                  key={option.$id}
                  className={`p-2 rounded-full min-w-12 border w-fit h-fit ${selected ? "border-green-400 bg-green-50" : ""}`}
                  style={!selected ? { borderColor: "#F97316" } : {}}
                  onPress={() => handleModifierPress(option)}
                >
                  <Text
                    className="font-[Nunito-regular] text-center text-[12px] text-orange-300"
                    style={{ color: selected ? color.moregreen : "#F97316" }}
                  >
                    {option.name}
                    {selected ? ` (${selected.qty})` : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <TouchableOpacity
        className="flex-row gap-2 items-center py-4"
        onPress={() => toggleAddSpecialInstructions((prev) => !prev)}
      >
        <MaterialIcons name="add-circle" size={24} color={color.moregreen} />
        <Text className="font-[Nunito-regular]">Add special instructions</Text>
      </TouchableOpacity>
      {addSpecialInstructions && (
        <CustomInput
          maxLength={100}
          multiline={true}
          value={specialInstruction}
          onChangeText={(text: string) => setSpecialInstruction(text)}
          style="w-[90%] self-center"
        />
      )}

      <CustomButton
        style={"bg-blue-300 mt-12 mb-14 "}
        title="Add to cart"
        onPress={() => {
          addItem({
            qty: qty,
            item: {
              ...selectedItem,
              fullName: buildOrderString(selectedItem, selectedModifiers),
              specialInstruction,
              modifierOptions: selectedModifiers ?? [],
            },
          });
          onClose();
        }}
      />
    </PopUpWrapper>
  );
};

export default MenuItemCartAddPopUp;
