import { images, color } from "@/constants";
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  StyleSheet,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut,
  ZoomIn,
  SlideInDown,
} from "react-native-reanimated";

import CustomOrderPop from "./CustomOrderPop";
import { router } from "expo-router";
const SMALL = 50;

const RATIO = 0.85; // height = width * RATIO — tweak this to taste

const LARGE_W = 250;
const LARGE_H = LARGE_W * RATIO;

const DEFAULT_W = 158;
const DEFAULT_H = DEFAULT_W * RATIO;

const RADIUS = 20;
const FULL_RADIUS = 999;

export default function Widgets() {
  const active = useSharedValue<null | number>(null);

  const holdTimeout = useRef(null);
const detailsTimeout = useRef(null);

  const [showDetails, setShowDetails] =
    useState<number | null>(null);

  const [openCustomOrder, toggleOpenCustomOrder] =
    useState(false);

  // Arrow floating animation
  const arrowFloat = useSharedValue(0);

  useEffect(() => {
    arrowFloat.value = withRepeat(
      withSequence(
        withTiming(-3, {
          duration: 500,
        }),
        withTiming(0, {
          duration: 500,
        })
      ),
      -1,
      true
    );
  }, []);

  const arrowStyle =
    useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY:
              arrowFloat.value,
          },
          {
            rotate: `${
              Math.sin(
                arrowFloat.value *
                  0.08
              ) * 5
            }deg`,
          },
        ],
      };
    });

const handlePressIn = (index) => {
  holdTimeout.current = setTimeout(() => {
    active.value = index;

    detailsTimeout.current = setTimeout(() => {
      setShowDetails(index);
    }, 250);
  }, 250);
};

const handlePressOut = () => {
  if (holdTimeout.current) {
    clearTimeout(holdTimeout.current);
    holdTimeout.current = null;
  }

  if (detailsTimeout.current) {
    clearTimeout(detailsTimeout.current);
    detailsTimeout.current = null;
  }

  active.value = null;
  setShowDetails(null);
};

const createStyle = (index) =>
  useAnimatedStyle(() => {
    if (active.value === null) {
      return {
        width: withTiming(DEFAULT_W),
        height: withTiming(DEFAULT_H),
        borderRadius: withTiming(RADIUS),
      };
    }

    const isTop = index === 1 || index === 2;
    const isLeft = index === 1 || index === 3;

    const activeTop = active.value === 1 || active.value === 2;
    const activeLeft = active.value === 1 || active.value === 3;

    const sameRow = (isTop && activeTop) || (!isTop && !activeTop);
    const sameCol = (isLeft && activeLeft) || (!isLeft && !activeLeft);

    let width = SMALL;
    let height = SMALL;

    if (sameRow) height = LARGE_H;
    if (sameCol) width = LARGE_W;

    const isActive = active.value === index;
    const isReduced = width === SMALL || height === SMALL;

    return {
      width: withTiming(width, { duration: 220 }),
      height: withTiming(height, { duration: 220 }),
      borderRadius: withTiming(
        isActive ? RADIUS : isReduced ? FULL_RADIUS : RADIUS,
        { duration: 280 }
      ),
    };
  });

  const box1 =
    createStyle(1);
  const box2 =
    createStyle(2);
  const box3 =
    createStyle(3);
  const box4 =
    createStyle(4);

  const renderDescription = (
    text: string,
    boxNumber: number,
    bubbleColor: string
  ) => {
    if (
      showDetails !==
      boxNumber
    )
      return null;

    return (
      <>
        {/* bubble */}
        
        <Animated.View
  entering={ZoomIn.springify()
    .damping(25)
    .stiffness(120)}
  exiting={FadeOut.duration(80)}
  style={[
    styles.descriptionBubble,
    { backgroundColor: 'transparent' },
  ]}
>
  <Animated.Text
    entering={
      FadeIn.springify()
        .damping(30)
        .stiffness(200)
        .withInitialValues({
          opacity: 0,
          transform: [{ scale: 0.85 }],
        })
    }
    style={styles.descriptionText}
  >
    {text}
  </Animated.Text>
</Animated.View>

        {/* arrow */}
        <Animated.Image
          source={
            images.cartoonArrow
          }
          resizeMode="contain"
          entering={FadeIn.duration(
            250
          )}
          exiting={FadeOut.duration(
            120
          )}
          style={[
            styles.arrow,
            arrowStyle,
          ]}
        />
      </>
    );
  };

  return (
    <View className="gap-4 my-6 mb-16">
      {/* TOP */}
      <Text className="text-black ">More</Text>
      <View className="flex-row gap-4">
        {/* BOX 1 */}
        <Pressable
          onPress={() =>
              router.push(
              "/(screens)/Choosecreatetype"
            )
           
          }
          onPressIn={() =>
            handlePressIn(1)
          }
          onPressOut={
            handlePressOut
          }
        >
          <Animated.View
            style={box1}
            className="overflow-hidden"
          >
            <ImageBackground
              source={
                images.startBrand
              }
              className="w-[300] top-1/2 -translate-y-1/2  absolute h-[300]"
            />
            <View style={styles.darkOverlay} />

            <Text
              style={
                styles.titleText
              }
              className="z-2 text-center w-[120] mx-auto my-auto"
            >
              start your brand
            </Text>

            {renderDescription(
              "Launch and manage multiple service stores with ease."
              ,
              1,
              "rgba(255,105,180,0.75)"
            )}
          </Animated.View>
        </Pressable>

        {/* BOX 2 */}
        <Pressable
          onPress={() =>
            router.push('/(screens)/BrowseEvents')         }
          onPressIn={() =>
            handlePressIn(2)
          }
          onPressOut={
            handlePressOut
          }
        >
          <Animated.View
            style={box2}
            className="overflow-hidden"
          >
            <ImageBackground
              source={
                images.businesslady
              }
              className="w-[300] top-1/2 -translate-y-1/2  left-1/2 -translate-x-1/2  absolute h-[300]"
            />
              <View style={styles.darkOverlay} />
            <Text
              style={
                styles.titleText
              }
              className="z-2 text-center w-[100] mx-auto my-auto"
            >
              Something for everyone
            </Text>

            {renderDescription(
              "Discover community offerings and schedule a booking.",
              2,
              "rgba(255,215,0,0.75)"
            )}
          </Animated.View>
        </Pressable>
      </View>

      {/* BOTTOM */}
      <View className="flex-row gap-4">
        {/* BOX 3 */}
        <Pressable
          onPress={() =>
               router.push("/(screens)/Questionaire")
          }
          onPressIn={() =>
            handlePressIn(3)
          }
          onPressOut={
            handlePressOut
          }
        >
          <Animated.View
            style={box3}
            className="overflow-hidden"
          >
            <ImageBackground
              source={
                images.joinFleet
              }
              className="w-[300] top-1/2 -translate-y-1/2 absolute h-[300]"
         
            />
            <View style={styles.darkOverlay} />
            <Text
              style={
                styles.titleText
              }
              className="z-2 text-center w-[100] mx-auto my-auto"
            >
              join the fleet
            </Text>

            {renderDescription(
              "Deliver packages and earn per trip.",
              3,
              "rgba(0,255,200,0.75)"
            )}
          </Animated.View>
        </Pressable>

        {/* BOX 4 */}
        <Pressable
          onPress={() =>
              toggleOpenCustomOrder(
              true
            )
          
          }
          onPressIn={() =>
            handlePressIn(4)
          }
          onPressOut={
            handlePressOut
          }
        >
          <Animated.View
            style={box4}
            className="overflow-hidden"
          >
            <ImageBackground
              source={
                images.womaneatschicken
              }
              className="w-[300] absolute h-[300]"
            />
            <View style={styles.darkOverlay} />
            <Text
              style={
                styles.titleText
              }
              className="z-2 text-center w-[120] mx-auto my-auto"
            >
              make a custom order
            </Text>

            {renderDescription(
              "Order items not currently available in our stores."
              ,
              4,
              "rgba(255,140,0,0.75)"
            )}
          </Animated.View>
        </Pressable>
      </View>

      <CustomOrderPop
        visible={
          openCustomOrder
        }
        onClose={() =>
          toggleOpenCustomOrder(
            false
          )
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    titleText: {
      fontSize: 12,
      fontFamily:
        "Crispy",
      lineHeight: 20,
      color:
        color.moregreen,

      textShadowColor:
        "#000",

      textShadowOffset: {
        width: -0.5,
        height: 0.5,
      },

      textShadowRadius: 1,
    },

    descriptionBubble:
      {
        position:
          "absolute",

        bottom: 8,
        alignSelf:
          "center",

        width: "85%",

        paddingHorizontal: 10,
        paddingVertical: 6,

        // borderRadius: 12,

        // borderWidth: 1,
        // borderColor:
        //   "rgba(255,255,255,0.25)",
      },

    descriptionText:
      {
        fontSize: 10,

        lineHeight: 14,

        fontFamily:
          "Crispy",

        textAlign:
          "center",

        color: "#fff",

        textShadowColor:
          "#000",

        textShadowOffset:
          {
            width: 0,
            height: 1,
          },

        textShadowRadius: 2,
      },

    arrow: {
      position:
        "absolute",
      height: 30,
      width: 30,
      right: 20,
      top: "50%",
    },
    darkOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.22)",
},
  });