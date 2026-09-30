import {
  TabBarProvider,
  useTabBarVisibility,
} from "@/contexts/TabBarVisibilityContext";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs, Redirect } from "expo-router";
import React from "react";
import { StatusBar, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { color } from "../../constants/index";
import useAuthStore from "@/store/auth.store";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type TabIconProps = {
  focused: boolean;
  icon: IconName; // filled variant
  iconOutline: IconName; // unfocused variant
  title: string;
  position?: number;
};

const INACTIVE = "#5D5F6D";

const TabHome = ({ focused, icon, iconOutline }: TabIconProps) => (
  <View className="top-[50%] border-zinc-500 relative border-r w-[94]">
    <View
      className="my-0 border border-1 w-[35] items-center justify-center h-[35] rounded-full self-center"
      style={{ borderColor: focused ? color.morange : INACTIVE }}
    >
      <Ionicons
        name={focused ? icon : iconOutline}
        size={20}
        color={focused ? color.morange : INACTIVE}
      />
    </View>
  </View>
);

const TabBarIcon = ({
  focused,
  icon,
  iconOutline,
  position,
}: TabIconProps) => (
  <View
    className="my-0 border border-1 w-[35] h-[35] items-center justify-center rounded-full self-center top-[50%] relative"
    style={{
      borderColor: focused ? color.morange : INACTIVE,
      left: position,
    }}
  >
    <Ionicons
      name={focused ? icon : iconOutline}
      size={20}
      color={focused ? color.morange : INACTIVE}
    />
  </View>
);

const AnimatedTabBar = (props: any) => {
  const { animatedStyle } = useTabBarVisibility();
  return (
    <Animated.View style={animatedStyle}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

const TabLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/sign-in" />;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#fafafae8",
            borderRadius: 30,
            paddingBottom: 0,
            position: "absolute",
            paddingVertical: "auto",
            marginBottom: 4,
            marginHorizontal: 20,
            shadowColor: "#1a1a1a",
            height: 70,
            shadowOffset: { width: 1, height: -0.5 },
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
              <TabHome
                title="Home"
                icon="home"
                iconOutline="home-outline"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="location"
          options={{
            title: "Location",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                title="Location"
                icon="location"
                iconOutline="location-outline"
                focused={focused}
                position={30}
              />
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
                icon="cart"
                iconOutline="cart-outline"
                focused={focused}
                position={20}
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
                icon="receipt"
                iconOutline="receipt-outline"
                focused={focused}
                position={10}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                title="Bookings"
                icon="calendar"
                iconOutline="calendar-outline"
                focused={focused}
                position={0}
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