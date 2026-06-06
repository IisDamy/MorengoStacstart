import { createVendor, getAdminId } from "@/lib/appwrite";
import React, { useState } from "react";
import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import CustomButton from "./ui/CustomButton";

interface CreateVendorLocationProps {
  coords: number[];
  isOpened: boolean;
}

const CreateVendorLocation = ({
  coords,
  isOpened,
}: CreateVendorLocationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    category: "",
    open: "",
    closes: "",
    description: "",
    coords: coords,
    ownerId: "69cd5f9500303c484eb8",
  });

  const createNewVendor = async () => {
    setIsLoading(true);
    try {
      const adminId = await getAdminId();
      if (!adminId)
        throw new Error(
          "Admin user not found. Cannot create vendor without an owner.",
        );
      const result = await createVendor({ ...newVendor, ownerId: adminId });
      if (result) Alert.alert("Vendor created successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setNewVendor({ ...newVendor, category });
  };

  if (!isOpened) return null;

  return (
    <View className=" gap-4 bg-white p-4 rounded-[15] absolute self-center top-[25%]">
      <View className="w-[180] border rounded-[5] border-zinc-300">
        <TextInput
          placeholder="name"
          placeholderTextColor={"#D4D4D8"}
          value={newVendor.name}
          style={{ textAlignVertical: "top" }}
          textAlignVertical="top"
          onChangeText={(text) => setNewVendor({ ...newVendor, name: text })}
        />
      </View>

      <View className="w-[180] h-[100] border rounded-[5] border-zinc-300">
        <TextInput
          placeholder="description"
          placeholderTextColor={"#D4D4D8"}
          value={newVendor.description}
          className="w-full h-full"
          multiline={true}
          onChangeText={(text) =>
            setNewVendor({ ...newVendor, description: text })
          }
        />
      </View>

      <View className="flex-row items-center justify-around">
        <View className="w-[55]  border rounded-[5] border-zinc-300">
          <TextInput
            placeholder="opens"
            keyboardType="numeric"
            placeholderTextColor={"#D4D4D8"}
            value={newVendor.open}
            onChangeText={(text) => setNewVendor({ ...newVendor, open: text })}
          />
        </View>
        <View className="w-[55]  border rounded-[5] border-zinc-300">
          <TextInput
            placeholder="closes"
            keyboardType="numeric"
            placeholderTextColor={"#D4D4D8"}
            value={newVendor.closes}
            onChangeText={(text) =>
              setNewVendor({ ...newVendor, closes: text })
            }
          />
        </View>
      </View>

      {/* Category Selection */}

      <View className="flex-row  border border-zinc-300 rounded-[5] items-center justify-around h-[100]  mt-2">
        <TouchableOpacity
          onPress={() => handleCategorySelect("restaurant")}
          className={`w-[45] h-[45] items-center justify-center rounded-[8] ${
            newVendor.category === "restaurant"
              ? "border border-yellow-300 bg-yellow-50"
              : "border border-zinc-300"
          }`}
        >
          <Text
            className={`text-sm ${newVendor.category === "restaurant" ? "text-yellow-600 font-semibold" : "text-gray-600"}`}
          ></Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleCategorySelect("local")}
          className={`w-[45] h-[45] items-center justify-center rounded-[8] ${
            newVendor.category === "local"
              ? "border border-yellow-300 bg-yellow-50"
              : "border border-zinc-300"
          }`}
        >
          <Text
            className={`text-sm ${newVendor.category === "local" ? "text-yellow-600 font-semibold" : "text-gray-600"}`}
          ></Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleCategorySelect("mobile")}
          className={`w-[45] h-[45] items-center justify-center rounded-[8] ${
            newVendor.category === "mobile"
              ? " border-yellow-300 bg-yellow-50 border"
              : "border border-zinc-300"
          }`}
        >
          <Text
            className={`text-sm ${newVendor.category === "mobile" ? "text-yellow-600 font-semibold" : "text-gray-600"}`}
          ></Text>
        </TouchableOpacity>
      </View>

      <CustomButton
        title="Create Vendor"
        isLoading={isLoading}
        style={"bg-blue-300 rounded-[10]"}
        onPress={createNewVendor}
      />
    </View>
  );
};

export default CreateVendorLocation;
