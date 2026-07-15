import { View, TouchableOpacity, Text } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { color } from '@/constants';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';



const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

interface PointsIconProps {
  points?: number;
}

const PointsIcon: React.FC<PointsIconProps> = ({ points = 0 }) => {
  const clampedPoints = Math.min(500, Math.max(0, points));
  
  const pointsRef = useRef(clampedPoints);

  useEffect(() => {
    pointsRef.current = clampedPoints;
  }, [clampedPoints]);

  // Shared values
  const fillerHeight = useSharedValue(
    clampedPoints < 500 ? (clampedPoints / 500) * 50 : 0
  );

  const borderColor = useSharedValue(
    clampedPoints === 500 ? color.morange : 'gold'
  );

  const iconColor = useSharedValue(
    clampedPoints === 500 ? color.morange : 'gold'
  );

  const iconScale = useSharedValue(1);

  // 👇 opacity animation
  const textOpacity = useSharedValue(0);

  const [pointsVisible, setPointsVisible] = React.useState(false);

  // Trigger opacity animation
const togglePoints = () => {
  const next = !pointsVisible;
  setPointsVisible(next);

  if (next) {
    // Fade in
    textOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });

    // Auto fade out after 5s
    setTimeout(() => {
      setPointsVisible(false);

      textOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    }, 3000);
  } else {
    // Manual close
    textOpacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }
};

  // Trigger point animations
  useEffect(() => {
    const current = clampedPoints;

    if (current < 500) {
      fillerHeight.value = withTiming((current / 50) * 24, {
        duration: 200,
      });

      borderColor.value = withTiming('gold', { duration: 200 });
      iconColor.value = withTiming('gold', { duration: 200 });
      iconScale.value = withTiming(1, { duration: 200 });
    } else {
      fillerHeight.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished && pointsRef.current === 500) {
          borderColor.value = withTiming(color.morange, {
            duration: 200,
          });

          iconColor.value = withTiming(color.morange, {
            duration: 200,
          });

          iconScale.value = withSequence(
            withTiming(0.8, {
              duration: 100,
              easing: Easing.out(Easing.quad),
            }),
            withTiming(1.3, {
              duration: 400,
              easing: Easing.out(Easing.quad),
            })
          );
        }
      });
    }
  }, [clampedPoints]);

  // Animated styles
  const fillerStyle = useAnimatedStyle(() => ({
    height: fillerHeight.value,
    backgroundColor: '#14a54a',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  }));

  const parentStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const iconAnimatedProps = useAnimatedProps(() => ({
    color: iconColor.value,
  }));

  // 👇 animated text style
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <>
      <TouchableOpacity
        onPress={togglePoints}
      >
        <Animated.View
          className="border overflow-hidden rounded-full flex items-center justify-center w-6 h-6"
          style={parentStyle}
        >
          <Animated.View style={fillerStyle} />

          <AnimatedIonicons
            name="sparkles"
            size={12}
            animatedProps={iconAnimatedProps}
            style={iconStyle}
          />
        </Animated.View>
      </TouchableOpacity>

     {pointsVisible && (
      <Animated.Text
        className="absolute text-xs text-white rounded-[15] top-[30] right-[30] p-2 bg-zinc-600"
        style={textStyle}
      >
        points: {clampedPoints}
      </Animated.Text>
)}
    </>
  );
};

export default PointsIcon;