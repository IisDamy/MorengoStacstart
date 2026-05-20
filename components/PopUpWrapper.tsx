
import React, { ReactNode, useCallback, useEffect} from "react";
import {
  Dimensions, Modal,TouchableWithoutFeedback, View, TouchableOpacity, Text, TextInput, Image, type ViewStyle,
} from "react-native";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";



const { height: SCREEN_HEIGHT } = Dimensions.get("window");


const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;



const SNAP_SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

const CLOSE_SPRING_CONFIG = {
  damping: 18,
  stiffness: 150,
  mass: 0.7,
};



interface MenuItemCartAddPopUpProps {
  visible: boolean;
  onClose: () => void;
  sheetStyle?: ViewStyle;
  children: ReactNode


}




const MenuItemCartAddPopUp: React.FC<MenuItemCartAddPopUpProps> = ({
  onClose,
  visible,
  sheetStyle,
  children
}) => {


  const translateY = useSharedValue(SHEET_HEIGHT);

  const overlayOpacity = useSharedValue(0);

  const triggerClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const animateClose = useCallback(() => {
    "worklet";
    overlayOpacity.value = withTiming(0, { duration: 220 });
    translateY.value = withSpring(SHEET_HEIGHT, CLOSE_SPRING_CONFIG, (done) => {
      if (done) scheduleOnRN(triggerClose);
    });
  }, [overlayOpacity, translateY, triggerClose]);




  useEffect(() => {
    if (visible) {
      translateY.value = SHEET_HEIGHT;
      overlayOpacity.value = 0;

      translateY.value = withSpring(0, SNAP_SPRING_CONFIG);
      overlayOpacity.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = SHEET_HEIGHT;
      overlayOpacity.value = 0;
    }
  }, [visible]); 

  

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleOverlayPress = useCallback(() => {
    animateClose();
  }, [animateClose]);




  return (
    
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleOverlayPress}
    >
    
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <Animated.View
            className="absolute inset-0 bg-black/55"
            style={overlayAnimatedStyle}
          />
        </TouchableWithoutFeedback>

   
        
          <Animated.View
            className="w-full absolute bottom-0 bg-white rounded-t-3xl overflow-hidden shadow-2xl"
            style={[{ height: SHEET_HEIGHT }, sheetAnimatedStyle, sheetStyle]}
          >
            <View
              className="w-full items-center pt-3 pb-1"
              pointerEvents="none"
            >
              <View className="w-10 h-1 rounded-full bg-neutral-300" />
            </View>
          
            <View className="flex-1  px-5 py-2">
                 <KeyboardAwareScrollView className='flex-1 h-full'
        keyboardShouldPersistTaps="handled"
         enableOnAndroid
  extraScrollHeight={120}>
      {children}
    </KeyboardAwareScrollView>
              </View>
          </Animated.View>
        
    </Modal>
    
  );
};

export default MenuItemCartAddPopUp;
