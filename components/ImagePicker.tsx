import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Image, TouchableOpacity, View } from "react-native";
import { displayImage } from "@/lib/appwrite";

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
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) return;

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.7,
            });

            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const permission =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) return;

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.7,
            });

            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const imageUri = image ? displayImage(image).toString() : undefined;

  return (
    <TouchableOpacity onPress={pickImage}>
      <View className="w-[100] h-[100] rounded-full mb-12 my-2 bg-zinc-300 items-center justify-center">
        
        {image ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full rounded-full"
          />
        ) : (
          <MaterialIcons name="camera-alt" size={28} color="gray" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ImagePickerD;
