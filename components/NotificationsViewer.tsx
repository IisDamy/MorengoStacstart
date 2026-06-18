import React from "react";
import {
  Text,
  Dimensions,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  SlideInRight,
  SlideOutRight,
  LinearTransition,
} from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import useNotificationStore from "@/store/notification.store";
import { NotificationViewerProps } from "@/types";

const SCREEN_WIDTH = Dimensions.get("window").width;

type NotificationItemProps = {
  msg: any;
  index: number;
  total: number;
  onRemove: (id: string) => void;
};

const NotificationItem = ({
  msg,
  index,
  total,
  onRemove,
}: NotificationItemProps) => {
  const enteringDelay = index * 60;
  const exitingDelay = (total - 1 - index) * 60;

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(280)}
      entering={SlideInRight
        .delay(enteringDelay)
        .springify()
        .damping(15)
        .stiffness(200)
        .mass(0.8)
        .withInitialValues({
          transform: [{ translateX: SCREEN_WIDTH }],
        })}
        
      exiting={SlideOutRight
        .delay(exitingDelay)
        .duration(120)}
      className="w-full bg-white opacity-90 rounded-lg p-4 py-5 shadow-md mb-4"
    >
      {/* Header row: type label + cancel button */}
      <View className="flex-row items-center justify-between mb-1">
        <Text
          className={`font-[Nunito-bold] text-sm ${
            msg.type === "success"
              ? "text-green-500"
              : msg.type === "error"
              ? "text-red-500"
              : "text-yellow-500"
          }`}
        >
          {msg.type}
        </Text>

        <TouchableOpacity
          onPress={() => onRemove(msg.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="ml-2"
        >
          <MaterialIcons name="close" color="#a1a1aa" size={16} />
        </TouchableOpacity>
      </View>

      <Text className="font-[Nunito-regular]">{msg.text}</Text>
    </Animated.View>
  );
};

const NotificationViewer = ({
  open,
  onClose,
}: NotificationViewerProps) => {
  const { msgs, clearMsgs, removeMsg } = useNotificationStore();

  return (
    <Animated.View
      className={`absolute top-10 right-0 w-64  overflow-hidden  p-4 ${
        !open ? "pointer-events-none" : ""
      }`}
    >

      {open && <Animated.View
       className="max-h-[400] overflow-hidden"
      //  layout={LinearTransition.springify().damping(20).stiffness(280)}
       >
            {msgs.map((msg, index) =>
              open && (
                <NotificationItem
                  key={msg.id}
                  msg={msg}
                  index={index}
                  total={msgs.length}
                  onRemove={removeMsg}
                />
              ) 
            )}
            </Animated.View>}
         
  

      {open && msgs.length > 0 && (
        <TouchableOpacity
          className="items-center justify-between flex-row mt-3"
          onPress={() => {
            onClose();
            clearMsgs();
          }}
        >
          <View className="w-1/3 h-[1px] bg-zinc-500" />
          <Text className="font-[Nunito-semiBold] text-xl text-red-600 tracking-widest">
            clear
          </Text>
          <View className="w-1/3 h-[1px] bg-zinc-500" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default NotificationViewer;