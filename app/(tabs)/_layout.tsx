import {
  TabBarProvider,
  useTabBarVisibility,
} from "@/contexts/TabBarVisibilityContext";
import { TabBarIconProps } from "@/types";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs, Redirect } from "expo-router";
import React,{useEffect} from "react";
import { Image, StatusBar, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { color, images } from "../../constants/index";
import useAuthStore from "@/store/auth.store";
import { getCurrentUser } from "@/lib/appwrite";

const TabLayout = () => {
const { isAuthenticated } = useAuthStore();
if(!isAuthenticated) return <Redirect href="/sign-in" />

const { animatedStyle } = useTabBarVisibility();




const TabHome  = ({ focused, icon, title, position }: TabBarIconProps) => {
    return (
      <View className="top-[50%] border-zinc-500  relative border-r w-[94]">
           <View
        className={`my-0 border  border-1 p-2 rounded-full self-center `}
        style={{
          borderColor: focused ? color.morange : "#5D5F6D",
          left:position
        }}
      >
        <Image
          source={icon}
          className="size-5"
          resizeMode="contain"
          tintColor={focused ? color.morange : "#5D5F6D"}
        />
      </View>
      </View>
     
    );
  };


  const TabBarIcon = ({ focused, icon, title, position }: TabBarIconProps) => {
    return (
      <View
        className={`my-0 border border-1 p-2 rounded-full self-center ${
          title === "Home" ? "right-0" : ""} top-[50%]  relative`}
        style={{
          borderColor: focused ? color.morange : "#5D5F6D",
          left:position
        }}
      >
        <Image
          source={icon}
          className="size-5"
          resizeMode="contain"
          tintColor={focused ? color.morange : "#5D5F6D"}
        />
      </View>
    );
  };

  function AnimatedTabBar(props: any) {
    

    return (
      <Animated.View style={[{}, animatedStyle]}>
        <BottomTabBar {...props} />
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <StatusBar
              barStyle={"dark-content"}
              backgroundColor={"transparent"}
             
              
            />
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,

          tabBarStyle: {
            //customize styling of this
            // it basically accepts css properties
            backgroundColor: "#fafafae8",
            borderRadius: 30,
            paddingBottom: 0,
            position: "absolute",
            paddingVertical: "auto",
            marginBottom:4,
            marginHorizontal: 20,
            shadowColor: "#1a1a1a",
            height: 70,

            shadowOffset: {
              width: 1,
              height: -0.5,
            },
            elevation: 1,
            shadowOpacity: 0.25,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabHome title="Home" icon={images.home} focused={focused} position={null}/>
            ),
          }}
        />
        <Tabs.Screen
          name="location"
          options={{
            title: "Location",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon title="Location" icon={images.home} focused={focused} position={30}/>
            ),
          }}
        />


         <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                title="Cart"
                icon={images.home}
                position={20}
                focused={focused}
              />
            ),
          }}
        />

         <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                title="Orders"
                position={10}
                icon={images.home}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                title="Profile"
                position={0}
                icon={images.profile}
                focused={focused}
              />
            ),
          }}
        />

      </Tabs>
    </SafeAreaView>
  );
};
export default function Layout() {
  return (
    <TabBarProvider>
      <TabLayout />
    </TabBarProvider>
  );
}
