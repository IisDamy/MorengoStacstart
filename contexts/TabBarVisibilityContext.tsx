import React, { createContext, useContext } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const TAB_BAR_HEIGHT = 120;

const TabBarContext = createContext<any>(null);

export function TabBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const translateY = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);
  const scale = useSharedValue(1);

  const onScroll = (event: any) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    const diff = currentOffsetY - lastOffsetY.value;

    // Hide tab bar
    if (diff > 3 && currentOffsetY > 0) {
      translateY.value = withTiming(TAB_BAR_HEIGHT, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });

      scale.value = withTiming(0.6, {
        duration: 100,
        easing: Easing.out(Easing.cubic),
      });
    }

    // Show tab bar
    else if (diff < -3) {
      translateY.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });

      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }

    lastOffsetY.value = currentOffsetY;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <TabBarContext.Provider
      value={{ onScroll, animatedStyle }}
    >
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBarVisibility() {
  return useContext(TabBarContext);
}