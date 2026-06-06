import { View, Text , StyleSheet} from 'react-native'
import React,{useState} from 'react'
import { RadioButton, RadioGroup } from "rn-radio-buttons";
import { color } from '@/constants';
import { CustomComponentProps } from '@/types';

interface CustomRadioProps {
  value: boolean,
  onValueChange: (value:any) => void,
  optiona:string,
  optionb:string,
  type:string,
  title:string
  
}


const CustomRadio = ({value, onValueChange, title, optiona, optionb, type}:CustomRadioProps) => {

  const options = [
    { label: <Text className='border-l-[1px] border-[#5f5f60] h-[25] py-0 pl-2 leading-normal'>{optiona} </Text>, value:type==='student'?true: false},
    { label: <Text className='border-l-[1px] border-[#5f5f60] h-[25] py-0 pl-2 leading-normal'>{optionb} </Text>, value:type==='student'?false: true },

  ];



  return (
    <View style={styles.form} className='px-4   '>
         <Text className=' text-lg font-semibold mt-8 tracking-wider'
         style={{
             color:color.moregreen,
             
         }}
         >* {title}</Text>
  
        <RadioGroup
        options={options}
        value={value}
        onChange={onValueChange}
        vertical={true}
        radioProps={{
          size: 14,
          borderColor: '#5f5f60',
          rotate:'90deg',
      
          selectedColor: color.dashboard,
          selectedBackgroundColor: color.morange,
          shape:'square',
          style:{
             gap:4
          }
        
        }}
        containerStyle={styles.radioGroup}
      />
    

    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    

  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  radioGroup: {
    gap: 20,
    padding: 16,
    paddingBottom:0
  },
});

export default CustomRadio