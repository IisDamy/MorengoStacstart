import { CustomInputProps } from "@/types";
import React,{useState} from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { color } from "@/constants";



const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  maxLength,
  label,
  style,
  multiline,
  secureTextEntry = false,
  keyboardType = "default",
}: CustomInputProps) => {


  const [isFocused, setIsFocused] = React.useState(false);
  const [isVisible, setIsVisible] = useState(false)
  return (
    <>
      <TextInput
        multiline={multiline || false}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`  py-3  font-[Nunito-regular] bg-zinc-100 border 
        border-zinc-200 rounded-2xl px-4  text-[14px] text-zinc-800
         ${style}
           ${
      multiline ? 'h-[100px]' : 'h-[55px]'} 
        `}
        autoCapitalize="none"
        autoCorrect={false}
    maxLength={maxLength || undefined}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={"#888"}
        secureTextEntry={
         label==='Password'?!isVisible:false
        }
      />
     {label==='Password' && 
     <TouchableOpacity 
      onPress={()=> setIsVisible(prev => !prev)}
     >
        <Ionicons name={isVisible?'eye-off-outline':'eye-outline'} size={20}
        color={'black'}
        className="relative  p-2 right-10 "
        /> 
      </TouchableOpacity>}   
    </>
  );
};

export default CustomInput;
