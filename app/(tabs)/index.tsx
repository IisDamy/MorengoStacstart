import {
  MenuFavouritePanel,
  NotificationBell,
  LocationChangeButton,
  PointsIcon,
} from "@/components";
import { color, images } from "@/constants";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
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
import Widgets from "@/components/Widgets";
import useAuthStore from "@/store/auth.store";
import HomeHeader from "@/components/ui/HomeHeader";
import HomeSearchBar from "@/components/ui/HomeSearchBar";
import NotificationViewer from "@/components/NotificationsViewer";
import { StatusBar } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import SubMenuPanel from "@/components/ui/SubMenuPanel";


export default function Index() {
  const { onScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();
  const [openNotifications, toggleOpenNotifictions] = useState(false);
  



  return (
    <View
    className="w-full bg-orange-50 h-full"
      
      style={{
        flex: 1,
        // backgroundColor: "#F8F8F8",
      }}
    >
      <StatusBar
      hidden={true}
      />
     
      <Animated.ScrollView
        className="w-full "
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 2,
        }}
      > 
        {/* HEADER */}
         <View style={{ position: "relative", top:12,   }}>
          <HomeHeader />
          <View
            style={{
              position: "absolute",
              bottom: 70, 
              alignSelf: "center",
             
            }}
          >
            <HomeSearchBar />
          </View>
        </View>

        {/* MAIN CONTENT */}
        <View
          className="w-full items-center px-6"
          style={{
            marginTop: 24,
          }}
        >
          {/* title */}
        
          {/* favourites */}
          {/* <SubMenuPanel /> */}
          <MenuFavouritePanel />
          

          {/* grid */}
          <Widgets />
        </View>
        {/* <NotificationViewer  open={openNotifications} onClose={() => toggleOpenNotifictions(false)} /> */}
      </Animated.ScrollView>
    </View>
  );
}

