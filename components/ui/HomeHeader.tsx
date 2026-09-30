import { View, Text, FlatList, TouchableOpacity, Pressable } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import {
  MenuFavouritePanel,
  NotificationBell,
  LocationChangeButton,
  PointsIcon,
} from "@/components";
import { color, images } from "@/constants";
import { LinearGradient } from "expo-linear-gradient";
import { Image, ImageBackground } from "react-native";
import SideMenu from './SideMenu';
import { CATEGORIESHEADER } from '@/constants';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Best-fit icon per category. Ionicons first, falling back to
// MaterialCommunityIcons where Ionicons has no good match (bakery).
const CATEGORY_ICONS = {
  groceries: { Lib: Ionicons, name: 'cart-outline' },
  fastfood: { Lib: Ionicons, name: 'fast-food-outline' },
  bakery: { Lib: MaterialCommunityIcons, name: 'cupcake' },
  tech: { Lib: Ionicons, name: 'phone-portrait-outline' },
  fashion: { Lib: Ionicons, name: 'shirt-outline' },
  local: { Lib: Ionicons, name: 'storefront-outline' },
};

const HomeHeader = () => {

  const [menuOpened, setMenuOpened] = useState(false)

  // useEffect(()=> {
  //   setMenuOpened(false)
  // },[])

  const openMenu = () => {setMenuOpened(true)}

  useEffect(( )=> {
    console.log(menuOpened)
  },[menuOpened])

  return (
    <View
      className="header flex justify-center pt-[66]
      px-[142] overflow-hidden items-center
      self-center h-[364] w-[170%]
      rounded-[130%]"
      style={{
        marginTop: -165,
        shadowColor: "#1a1a1a",
        shadowOffset: { width: 0, height: -3 },
        elevation: 2,
        shadowOpacity: 0.25,
      }}
    >
      <LinearGradient
        className="w-screen absolute bottom-[-10] h-[230]"
        colors={[color.moregreen, color.morange]}
      />

      <View className="items-center flex absolute bottom-0 h-[200] w-screen">
        <ImageBackground
          source={images.allsorts}
          tintColor="#1f293796"
          resizeMode="repeat"       
          className="w-full h-full absolute"
        />
      </View>

      <View className="flex flex-col w-full  items-center gap-4 mt-0">
        <View className="w-full flex-row  justify-between relative bottom-[2]">
          <LocationChangeButton />
          <View className='gap-8 items-center flex-row'>
            <NotificationBell color1='#F0FDF4'/>


             <TouchableOpacity  className='  menuButton border-[#DCFCE7] my-auto justify-center  items-center  h'
            style={{
                borderColor:'#DCFCE7',
                borderRadius:50       
            }}
            // disabled={menuOpened}
            onPress={()=> setMenuOpened(true)}

          >     <Ionicons name='menu' color={'#F0FDF4'} size={25} />
                {/* <Image source={images.menu} resizeMode='contain' tintColor={'#DCFCE7'} className='w-6 h-6' /> */}
          </TouchableOpacity>         
          </View>
         
          
          
        </View>

        <Text
          className="text-xl relative bottom-[6]"
          style={{
            fontFamily: "Crispy",
            color: color.morange,
            textShadowColor: "white",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 0.6,
          }}
        >
          morengo
        </Text>

        {/* search + dropdown wrapper */}
      
       
      </View>
        <View className='w-full flex-row justify-around px-7 absolute bottom-[4%]'>
           {CATEGORIESHEADER.map((category, index) => {
             const icon = CATEGORY_ICONS[category];
             const IconComponent = icon.Lib;

             // Rainbow-style arc, concave side facing down: the two ends
             // sit lower, the middle sits higher.
             const mid = (CATEGORIESHEADER.length - 1) / 2;
             const arcAmplitude = -14;
             const arcOffset = arcAmplitude * Math.pow((index - mid) / mid, 2);

             return (
               <View
                 key={category}
                 className='w-9 h-9 rounded-full border-white/80 border  items-center justify-center'
                 style={{ transform: [{ translateY: arcOffset }] }}
               >
                 <IconComponent name={icon.name} size={18} color="#ffffffdc" />
               </View>
             );
           })}
        </View>
      
      <SideMenu visible={menuOpened} onClose={()=> setMenuOpened(false)}/>
    </View>
  )
}

export default HomeHeader