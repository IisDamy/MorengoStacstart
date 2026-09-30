import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import useNotificationStore from "@/store/notification.store";
import { NotificationViewerProps } from "@/types";
import { scheduleOnRN } from "react-native-worklets";

type NotificationItemProps = {
  msg: any;
  onRemove: (id: string) => void;
};

const TYPE_STYLES: Record<
  string,
  { chip: string; icon: string; iconColor: string }
> = {
  success: {
    chip: "bg-emerald-400/15",
    icon: "check",
    iconColor: "#34d399",
  },
  error: {
    chip: "bg-rose-400/15",
    icon: "x",
    iconColor: "#fb7185",
  },
  warning: {
    chip: "bg-amber-400/15",
    icon: "alert-triangle",
    iconColor: "#fbbf24",
  },
};

const NotificationItem = ({ msg, onRemove }: NotificationItemProps) => {
  const style = TYPE_STYLES[msg.type] ?? TYPE_STYLES.warning;

  return (
    <View
      layout={LinearTransition.duration(180)}
      entering={FadeInDown.duration(180)}
      exiting={FadeOutUp.duration(140)}
      className="w-full flex-row items-start py-4 border-b border-zinc-800/80"
    >
      <View className={`w-9 h-9 rounded-full items-center justify-center ${style.chip}`}>
        <Feather name={style.icon} color={style.iconColor} size={16} />
      </View>

      <View className="flex-1 ml-3.5">
        <Text className="font-[Nunito-regular] text-[13px] leading-5 text-zinc-200">
          {msg.text}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(msg.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="ml-3 mt-1"
      >
        <MaterialIcons name="close" color="#52525b" size={16} />
      </TouchableOpacity>
    </View>
  );
};

const NotificationViewer = ({
  open,
  onClose,
}: NotificationViewerProps) => {
  const { msgs, clearMsgs, removeMsg } = useNotificationStore();

  // Modal stays mounted for the duration of our own fade-out, so the
  // backdrop + card + list disappear together instead of the native
  // Modal window vanishing before in-flight item animations finish.
  const [modalVisible, setModalVisible] = useState(open);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setModalVisible(true);
      progress.value = withTiming(1, { duration: 160 });
    } else {
      progress.value = withTiming(0, { duration: 160 }, (finished) => {
        if (finished) scheduleOnRN(setModalVisible, false);
      });
    }
  }, [open]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.97 + progress.value * 0.03 }],
  }));

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none" // we drive the fade ourselves, no native transition to fight with
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={overlayStyle}
        className="flex-1 bg-black/70 items-center justify-center px-6"
      >
        {/* tap outside to close */}
        <Pressable
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          onPress={onClose}
        />

        <View
          style={cardStyle}
          className="w-full bg-zinc-900 rounded-2xl px-5 pt-5 pb-4 max-h-[70%] border border-zinc-800"
        >
          {/* Header: title + count + close icon */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <Text className="font-[Nunito-bold] text-base text-white">
                Notifications
              </Text>
              {msgs.length > 0 && (
                <View className="ml-2 bg-zinc-800 rounded-full px-2 py-0.5">
                  <Text className="font-[Nunito-semiBold] text-[11px] text-zinc-300">
                    {msgs.length}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" color="#71717a" size={20} />
            </TouchableOpacity>
          </View>

          {msgs.length === 0 ? (
            <View className="items-center py-12">
              <Feather name="bell-off" size={24} color="#52525b" />
              <Text className="font-[Nunito-regular] text-[13px] text-zinc-500 mt-3">
                Nothing new right now
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} className="mt-1">
              {msgs.map((msg) => (
                <NotificationItem key={msg.id} msg={msg} onRemove={removeMsg} />
              ))}
            </ScrollView>
          )}

          {msgs.length > 0 && (
            <TouchableOpacity
              className="items-center justify-center mt-3 py-3"
              onPress={() => {
                onClose();
                clearMsgs();
              }}
            >
              <Text className="font-[Nunito-semiBold] text-[13px] text-zinc-500">
                Clear all
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default NotificationViewer;