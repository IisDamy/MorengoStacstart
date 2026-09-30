import { useRef, useState } from "react";
import { View, TouchableOpacity, Text, FlatList } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { router } from "expo-router";
import { getVendorSuggestions } from "@/lib/appwrite"; // adjust path to match your project

const HomeSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const handleChangeText = (text:string) => {
    setSearchQuery(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const results = await getVendorSuggestions(text);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);
  };

  const handleSelectSuggestion = (name:string) => {
    console.log('weee', name);
    setSearchQuery(name);
    setShowSuggestions(false);
    router.push(`/(screens)/SearchPage?query=${name}`);
  };

  const handleSubmit = () => {
    setShowSuggestions(false);
    router.push(`/(screens)/SearchPage?query=${searchQuery}`);
  };

  return (
    <View className="w-[135] overflow-visible z-50">
      <TextInput
        className="text-zinc-500
        
        bg-white px-3 
        py-0
        text-sm
        w-full h-10
        font-[Nunito-light]
        rounded-[10]"
        textAlignVertical="center"
        placeholder="Search..."
        value={searchQuery}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 6000)}
      />

      {showSuggestions && (
        <View
          className="absolute mt-4 top-[30] left-0 w-full bg-white rounded-[10]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          {/* <FlatList
            data={suggestions}
            keyExtractor={(item) => item.$id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-3 py-2 border-b border-zinc-100"
                onPress={() => handleSelectSuggestion(item.name)}
              >
                <Text className="text-sm text-zinc-700">{item.name}</Text>
              </TouchableOpacity>
            )}
          /> */}
          {suggestions.map(item => (<TouchableOpacity
          key={item.$id}
                className="px-3 py-2 border-b border-zinc-100"
                onPress={() => handleSelectSuggestion(item.name)}
              >
                <Text className="text-sm text-zinc-700">{item.name}</Text>
              </TouchableOpacity>))}
        </View>
      )}
    </View>
  );
};

export default HomeSearchBar;