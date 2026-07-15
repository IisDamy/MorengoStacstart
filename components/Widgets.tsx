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

const SMALL = 60;
const LARGE = 250;
const DEFAULT = 160;

const RADIUS = 15;
const FULL_RADIUS = 999;

export default function Widgets() {
  const active = useSharedValue<null | number>(null);

  const holdTimeout = useRef<NodeJS.Timeout | null>(null);

  const [showDetails, setShowDetails] =
    useState<number | null>(null);

  const [openCustomOrder, toggleOpenCustomOrder] =
    useState(false);

  // Arrow floating animation
  const arrowFloat = useSharedValue(0);

  useEffect(() => {
    arrowFloat.value = withRepeat(
      withSequence(
        withTiming(-5, {
          duration: 650,
        }),
        withTiming(0, {
          duration: 650,
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

  const handlePressIn = (
    index: number
  ) => {
    holdTimeout.current =
      setTimeout(() => {
        active.value = index;

        setTimeout(() => {
          setShowDetails(index);
        }, 250);
      }, 250);
  };

  const handlePressOut = () => {
    if (holdTimeout.current) {
      clearTimeout(
        holdTimeout.current
      );
    }

    active.value = null;
    setShowDetails(null);
  };

  const createStyle = (
    index: number
  ) =>
    useAnimatedStyle(() => {
      if (
        active.value === null
      ) {
        return {
          width: withTiming(
            DEFAULT
          ),
          height: withTiming(
            DEFAULT
          ),
          borderRadius:
            withTiming(RADIUS),
        };
      }

      const isTop =
        index === 1 ||
        index === 2;

      const isLeft =
        index === 1 ||
        index === 3;

      const activeTop =
        active.value === 1 ||
        active.value === 2;

      const activeLeft =
        active.value === 1 ||
        active.value === 3;

      const sameRow =
        (isTop &&
          activeTop) ||
        (!isTop &&
          !activeTop);

      const sameCol =
        (isLeft &&
          activeLeft) ||
        (!isLeft &&
          !activeLeft);

      let width = SMALL;
      let height = SMALL;

      if (sameRow)
        height = LARGE;

      if (sameCol)
        width = LARGE;

      const isActive =
        active.value === index;

      const isReduced =
        width === SMALL ||
        height === SMALL;

      return {
        width: withTiming(
          width,
          {
            duration: 220,
          }
        ),

        height:
          withTiming(
            height,
            {
              duration: 220,
            }
          ),

        borderRadius:
          withTiming(
            isActive
              ? RADIUS
              : isReduced
              ? FULL_RADIUS
              : RADIUS,
            {
              duration: 280,
            }
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
            .damping(20)
            .stiffness(110)}
          exiting={FadeOut.duration(
            100
          )}
          style={[
            styles.descriptionBubble,
            {
              backgroundColor:
                bubbleColor,
            },
          ]}
        >
          {/* text */}
        <Animated.Text
  entering={
    FadeIn.springify()
      .damping(24)
      .stiffness(110)
      .withInitialValues({
        opacity: 0,
        transform: [{ scale: 0.6 }],
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
    <View className="gap-2">
      {/* TOP */}
      <View className="flex-row gap-2">
        {/* BOX 1 */}
        <Pressable
          onPress={() =>
            toggleOpenCustomOrder(
              true
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
                images.customdelivery
              }
              className="w-[300] absolute h-[300]"
            />

            <Text
              style={
                styles.titleText
              }
              className="z-2 text-center w-[100] mx-auto my-auto"
            >
              make a CUSTOM ORDER
            </Text>

            {renderDescription(
              "Order items not currently available in our stores.",
              1,
              "rgba(255,105,180,0.75)"
            )}
          </Animated.View>
        </Pressable>

        {/* BOX 2 */}
        <Pressable
          onPress={() =>
            console.log(
              "clicked box 2"
            )
          }
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
              className="w-[300] absolute h-[300]"
            />

            <Text
              style={
                styles.titleText
              }
              className="z-2 text-center w-[100] mx-auto my-auto"
            >
              Laundry, gas and
              more..
            </Text>

            {renderDescription(
              "Manage multiple service stores with ease.",
              2,
              "rgba(255,215,0,0.75)"
            )}
          </Animated.View>
        </Pressable>
      </View>

      {/* BOTTOM */}
      <View className="flex-row gap-2">
        {/* BOX 3 */}
        <Pressable
          onPress={() =>
            router.push(
              "/(screens)/CreateStore"
            )
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
                images.womaneatschicken
              }
              className="w-[300] absolute h-[300]"
            />

            <Text
              style={
                styles.titleText
              }
              className="z-2 text-center w-[100] mx-auto my-auto"
            >
              create a vendor
              store
            </Text>

            {renderDescription(
              "Launch and manage your own store.",
              3,
              "rgba(0,255,200,0.75)"
            )}
          </Animated.View>
        </Pressable>

        {/* BOX 4 */}
        <Pressable
          onPress={() =>
           router.push("/(screens)/Questionaire")
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

            <Text
              style={
                styles.titleText
              }
              className="z-2 text-center w-[100] mx-auto my-auto"
            >
              become a rider
            </Text>

            {renderDescription(
              "Deliver packages and earn per trip.",
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
      fontSize: 14,
      fontFamily:
        "Crispy",
      lineHeight: 20,
      color:
        color.morange,

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

        borderRadius: 12,

        borderWidth: 1,
        borderColor:
          "rgba(255,255,255,0.25)",
      },

    descriptionText:
      {
        fontSize: 11,

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
      height: 50,
      width: 50,
      right: 5,
      top: "40%",
    },
  });