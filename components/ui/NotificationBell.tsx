import { color } from "@/constants";
import useNotificationStore from "@/store/notification.store";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Text, View } from "react-native";

interface NotificationBellProps {
  color1: string;
  color2: string;
}

const NotificationBell = ({ color1, color2 }: NotificationBellProps) => {
  const [open, setOpen] = useState(false);
  const { msgs } = useNotificationStore();

  return (
    <View>
      <Feather name="bell" size={22} color={color1 ? color1 : "white"} />
      <Text
        className="absolute font-[Nunito-bold] w-4 h-4 left-[12] text-[8px] pt-[1] text-yellow-100 overflow-hidden text-center rounded-full"
        style={{ backgroundColor: color2 ? color2 : color.morange }}
      >
        {msgs.length > 9 ? "9+" : msgs.length}
      </Text>
    </View>
  );
};

export default NotificationBell;
