import { color } from '@/constants';
import React, {useState} from 'react';
import {TouchableOpacity, Animated, StyleSheet, Easing} from 'react-native';


import { Switch, View, Text } from 'react-native';

interface ToggleProps {
  isEnabled:boolean,
  toggleSwitch: () => void
}

const ToggleButton= ({isEnabled, toggleSwitch}:ToggleProps) => {


  return (
    <>
      <Switch
         
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
           trackColor={{false: '#d6d4d8', true: '#CEE8E7'}}
          thumbColor={isEnabled ? '#0A8791' : '#f4f3f4'}
        onValueChange={toggleSwitch}
        value={isEnabled}
     
      />
    </>
  );}
export default ToggleButton;