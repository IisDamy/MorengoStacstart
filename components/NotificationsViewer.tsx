import React from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Animated, {
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import useNotificationStore from '@/store/notification.store';
import { NotificationViewerProps } from "@/types";

const SCREEN_WIDTH = Dimensions.get("window").width;

type NotificationItemProps = {
  msg: any;
  index: number;
  total: number;
  open: boolean;
  
};

const NotificationItem = ({
  msg,
  index,
  total,
  open,
}: NotificationItemProps) => {
  // Opening: top -> bottom
  const enteringDelay = (index / 2) * 60;
  
  // Closing: bottom -> top
  const exitingDelay = (total - 1 - index) * 40;

  return (
    <Animated.View
      entering={SlideInRight
        .duration(60)
        .delay(enteringDelay)
        .withInitialValues({
          transform: [{ translateX: SCREEN_WIDTH }],
        })}
      exiting={SlideOutRight
        .duration(60)
        .delay(exitingDelay)}
      className="w-full opacity-90 bg-white p-4 rounded-lg py-5 shadow-md"
    >
      <Text
        className={`font-[Nunito-bold] text-sm mb-1 ${
          msg.type === "success"
            ? "text-green-500"
            : msg.type === "error"
            ? "text-red-500"
            : "text-yellow-500"
        }`}
      >
        {msg.type}
      </Text>

      <Text className="font-[Nunito-regular]">
        {msg.text}
      </Text>
    </Animated.View>
  );
};





const NotificationViewer = ({

  open,
  onClose
}: NotificationViewerProps) => {
  const { msgs, clearMsgs } = useNotificationStore();



  return (
    <Animated.View
      className={`absolute items-center top-10 right-0 w-64 gap-4 p-4 h-[50%] overflow-hidden ${
        !open ? "pointer-events-none" : ""
      }`}
    >
      {msgs.length === 0 ? (
        open && (
          <Text className="font-[Nunito-regular] ml-auto text-sm text-zinc-200">
            No notifications
          </Text>
        )
      ) : (
        msgs.map((msg, index) =>
          open ? (
            <NotificationItem
              key={`${index}-${msg.text}`}
              msg={msg}
              index={index}
              total={msgs.length}
              open={open}
            />
          ) : null
        )
      )}

      {
      (open && msgs.length > 0) && (
        <TouchableOpacity onPress={() => {
          clearMsgs()
          onClose()
          }}>
          <MaterialIcons
            name="close"
            color={"red"}
            size={26}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default NotificationViewer;