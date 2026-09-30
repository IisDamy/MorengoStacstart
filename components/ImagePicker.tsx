// components/ImagePicker.tsx
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Image, TouchableOpacity, View } from "react-native";

const ImagePickerD = ({
  image,
  setImage,
}: {
  image: string | null;
  setImage: (image: string) => void;
}) => {
  const pickImage = async () => {
    try {
      Alert.alert("Select Image", "Choose an option", [
        {
          text: "Camera",
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) return;

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.7,
            });

            if (!result.canceled) setImage(result.assets[0].uri);
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) return;

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.7,
            });

            if (!result.canceled) setImage(result.assets[0].uri);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} className="self-center">
      <View className="w-[104] h-[104] rounded-full bg-zinc-200 items-center justify-center overflow-hidden">
        {image ? (
          <Image source={{ uri: image }} className="w-full h-full" />
        ) : (
          <MaterialIcons name="camera-alt" size={28} color="#9CA3AF" />
        )}
      </View>
      <View className="absolute bottom-0 right-0 bg-blue-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
        <MaterialIcons name="edit" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );
};

export default ImagePickerD;