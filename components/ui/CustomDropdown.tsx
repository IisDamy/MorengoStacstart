import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import DropDownPicker, {
  RenderListItemPropsInterface,
} from 'react-native-dropdown-picker';
import { universities } from '@/constants';
import { CustomComponentProps } from '@/types';

const CustomDropdown = ({ value, onValueChange }: CustomComponentProps) => {
  // Use a unique ID (e.g., $id) as the value for reliable comparisons
  const items = universities.map((uni, index) => ({
    label: uni.name,
    value: uni.name,          // Primitive value
              // Keep full object for later use
  }));

  const [open, setOpen] = useState(false);

  const renderListItem = ({
    isSelected,
    onPress,
    item,
  }: RenderListItemPropsInterface<any>) => (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Text
        style={{
          padding: 16,
          color: isSelected ? '#57a886' : '#000',
        }}
        className="leading-6 border-b border-gray-200"
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="w-full">
      <DropDownPicker
        listMode="SCROLLVIEW"
        maxHeight={400}
        open={open}
        items={items}
        value={value}   // Pass the primitive ID
        setOpen={setOpen}
           setValue={(callback) => {
        // The callback pattern from react-native-dropdown-picker
        const newValue = callback(value);
        onValueChange(newValue);
        return newValue;}}
        searchable={true}
        placeholder="Select your institution"
        searchPlaceholder="Search for your institution"
        style={{
          borderRadius: 10,
          backgroundColor: '#f4f4f5',
          paddingHorizontal: 8,
          borderColor: '#e4e4e7',
          borderWidth: 1,
          height: 48,
          width: '100%',
        }}
        dropDownContainerStyle={{
          borderRadius: 10,
          borderColor: '#e4e4e7',
          borderWidth: 1,
        }}
        searchContainerStyle={{
          borderBottomColor: 'transparent',
          borderColor: 'transparent',
          height: 80,
        }}
        searchTextInputStyle={{
          fontSize: 14,
          height: 40,
          margin: 0,
          padding: 0,
        }}
        
        
        renderListItem={renderListItem}
        ListEmptyComponent={() => (
          <Text style={{ padding: 16, paddingTop: 0, textAlign: 'center' }}>
            No matching results found
          </Text>
        )}
      />
    </View>
  );
};

export default CustomDropdown;