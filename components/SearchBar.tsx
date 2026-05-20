import {images} from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Filter from "./Filter";


const Searchbar = () => {
    const params = useLocalSearchParams<{ query: string }>();
    const [query, setQuery] = useState(params.query);

    const handleSearch = (text: string) => {
        setQuery(text);

        if(!text) router.setParams({ query: undefined });
    };

    const handleSubmit = () => {
        if(query.trim()) router.setParams({ query });
    }

    return (
        <View className="searchbar w-[90%] border relative flex flex-row items-center  justify-center bg-white shadow-md shadow-black/10 rounded-full  font-quicksand-medium text-dark-100 gap-5;
    ">
          <TextInput
                className="flex-1 p-5"
                placeholder="Search..."
                value={query }
                onChangeText={handleSearch}
                onSubmitEditing={handleSubmit}
                placeholderTextColor="#A0A0A0"
                returnKeyType="search"
            />
            <TouchableOpacity
                className="pr-5"
                // onPress={() => router.setParams({ query })}
            >
                {/* <Image
                    source={images.search}
                    className="size-6"
                    resizeMode="contain"
                    tintColor="#5D5F6D"
                /> */}
                <Filter />
                {/* <View className="absolute w-[150] h-[150] bg-white">

                </View> */}
            </TouchableOpacity>
        </View>
    );
};

export default Searchbar;