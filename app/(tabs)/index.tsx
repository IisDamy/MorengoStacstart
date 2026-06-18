import {
  MenuFavouritePanel,
  NotificationBell,
  LocationChangeButton,
  PointsIcon,
} from "@/components";
import { color, images } from "@/constants";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import GridAnim from "@/components/BotttomGridMain";
import { TextInput } from "react-native-gesture-handler";
import useAuthStore from "@/store/auth.store";

import NotificationViewer from "@/components/NotificationsViewer";


export default function Index() {
  const { onScroll } = useTabBarVisibility();
  const [seeAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();
  const [openNotifications, toggleOpenNotifictions] = useState(false);



  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8F8F8",
      }}
    >
      <Animated.ScrollView
        className="w-full"
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {/* HEADER */}
        <View
          className="header flex justify-center pt-[60]
          px-[142] overflow-hidden items-center
          self-center h-[360] w-[170%]
          rounded-[130%]"
          style={{
            marginTop: -160,
            shadowColor: "#1a1a1a",
              shadowOffset: { width: 0, height: -3 },
              elevation: 2,
              shadowOpacity: 0.25,
          }}
        >
          {/* gradient */}
          <LinearGradient
            className="w-screen absolute bottom-[-10] h-[230]"
            colors={[color.moregreen, color.morange]}
          />

          {/* background images */}
          <View className="items-center flex absolute bottom-0 h-[200] w-screen">
          

            <Image
              source={images.allsorts}
              tintColor="#1f2937bf"
        
              
              resizeMode="repeat"
              className="w-full  h-full 
              absolute 
              "/>
           
       
          </View>

          {/* header content */}
          <View
            className="flex flex-col
            w-full items-center
            gap-4 mt-12"
          >
            {/* location / score / notifications */}
            <View
              className="w-full flex-row
              justify-between
              relative bottom-[2]"
            >
              <LocationChangeButton />

              <View className="mr-2 flex-row gap-8 items-center">
                <PointsIcon points={user?.points || 0} />
                <TouchableOpacity onPress={() => toggleOpenNotifictions(!openNotifications)}>
                  <NotificationBell />
                </TouchableOpacity>
                
              </View>
            </View>

            {/* logo */}
            <Text
              className="text-xl relative   bottom-[7]"
              style={{
                fontFamily: "Crispy",
                color: color.morange,
                textShadowColor: "white",
                textShadowOffset: {
                  width: 1,
                  height: 1,
                },
                textShadowRadius: 0.6,
              }}
            >
              morengo
            </Text>
  

            {/* search */}
            <TextInput
              className="relative
              top-[12]
              text-zinc-500
              bg-white px-3 
              py-0
              text-sm
              w-[135] h-10
              font-[Nunito-light]
              rounded-[10]"
              textAlignVertical="center"   
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() =>
                router.push(
                  `/(screens)/SearchPage?query=${searchQuery}`
                )
              }
              onBlur={() => setSearchQuery("")}
            />
          </View>
        </View>

        {/* MAIN CONTENT */}
        <View
          className="w-full items-center px-6"
          style={{
            marginTop: 0,
          }}
        >
          {/* title */}
          <View className="flex-row w-full justify-between">
            <Text className=" font-[Nunito-extraBold] tracking-wider">
              Favourite
            </Text>

            <TouchableOpacity
              onPress={() => {
                router.push("/(screens)/SearchPage");
              }}
            >
              <Text className="text-green-300 font-[Nunito-bold] tracking-wider text-sm ">
                See more
              </Text>
            </TouchableOpacity>
          </View>

          {/* favourites */}
          <MenuFavouritePanel seeAll={seeAll} />

          {/* grid */}
          <GridAnim />
        </View>
        <NotificationViewer  open={openNotifications} onClose={() => toggleOpenNotifictions(false)} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}