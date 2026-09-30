import { View, Text, TouchableOpacity, Pressable, Animated, Dimensions, StyleSheet, Modal } from 'react-native'
import React, { useRef, useEffect, useState } from 'react'
import { color } from "@/constants";
import { router } from 'expo-router';
import ToggleButton from '../ToggleButton';
import { signOut } from '@/lib/appwrite';
import ConnectBankModal from '../ConnectBankModal';
import useAuthStore from '@/store/auth.store';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

const menuData = [
  {
    key: 'account',
    title: 'My Account',
    children: ['Profile', 'History', 'My Points', 'Dashboard'],
  },
  {
    key: 'payment',
    title: 'Payment',
    children: ['Bank Details', 'Connect Bank'],
  },
  {
    key: 'notification',
    title: 'Notification',
    children: ['Noifications','Promotional Notifications'],
  },
];

const SideMenu = ({ visible, onClose }) => {
  const translateX = useRef(new Animated.Value(MENU_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  // controls whether <Modal> itself is mounted, so we can animate OUT before it unmounts
  const [modalVisible, setModalVisible] = useState(visible);
  const ROUTESECTIONS = ['Profile', 'History','Dashboard']
  const [enablePromoNotifs, setEnablePromoNotifs] = useState(true);
  const [enableNotifs, setEnableNotifs] = useState(true);
  const [bankModal, setBankModal] = useState(false);
  const {user} = useAuthStore()

const handleSelectSection = (section: string) => {
  if (section === 'Connect Bank') {
    // slide the menu out first, then open the bank modal
    animateOut(() => {
      setModalVisible(false);
      onClose && onClose();
      // small delay: iOS can't present a Modal while another is still dismissing
      setTimeout(() => setBankModal(true), 350);
    });
    return;
  }

  if (ROUTESECTIONS.includes(section)) {
    onClose();
    router.push(`/(screens)/${section}`);
  }
};



  useEffect(() => {
    if (visible) {
      setModalVisible(true); // mount modal first, THEN animate in (next effect tick / after render)
    } else {
      // animate out, then unmount the modal
      animateOut(() => setModalVisible(false));
    }
  }, [visible]);

  useEffect(() => {
    if (visible && modalVisible) {
      animateIn();
    }
  }, [visible, modalVisible]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: MENU_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => callback && callback());
  };

  const handleClose = () => {
    // animate first, then tell parent to flip `visible` off
    animateOut(() => {
      setModalVisible(false);
      onClose && onClose();
    });
  };

  return (
    <>
    <Modal
      visible={modalVisible}
      transparent
      animationType="none" // we drive the animation ourselves
      onRequestClose={handleClose} // Android back button
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        {/* dim overlay, tap to close */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0,0,0,0.4)', opacity: overlayOpacity },
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>

        {/* sliding panel */}
        <Animated.View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: SCREEN_HEIGHT,
            width: MENU_WIDTH,
            backgroundColor: '#ffffff',
            transform: [{ translateX }],
            paddingTop: 40,
            paddingHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 10,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              {/* <View className='self-end mr-2 mb-2'>
                
              </View> */}
              
              {menuData.map((section) => (
                <View key={section.key} style={{ marginBottom: 8 }}>
                  <View className="py-3 flex-row justify-between items-center">
                    <Text
                      style={{ fontFamily: 'Crispy', color: color.moregreen }}
                      className="text-base"
                    >
                      {section.title}
                    </Text>
                  </View>

                  {section.children && (
                    <View className="pl-3">
                      {section.children.map((item) => (
                        section.key === 'notification'?
                        <View className="py-2 justify-between flex-row">
                          <Text className="text-sm text-gray-600">{item}</Text>
                            <ToggleButton isEnabled/>
                        </View>
                        :
                        <TouchableOpacity key={item} className="py-2" onPress={() => handleSelectSection(item)}>
                          <Text className="text-sm text-gray-600">{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={{ marginBottom: 60 }}>
              <TouchableOpacity className="py-3 border-t border-gray-200">
                <Text className="text-base text-gray-700">Connect With Us</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-3" onPress={ () => {
                handleClose()
                signOut()
                }}>
                <Text className="text-base text-red-500">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>

     <ConnectBankModal
      visible={bankModal}
      onClose={() => setBankModal(false)}
      userId={user.$id}
      onSuccess={() => { /* refetch bank accounts if you list them */ }}
    />
    </>
   
   
  );
};

export default SideMenu;