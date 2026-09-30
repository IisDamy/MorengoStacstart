import { color, images } from "@/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Choice Card ──────────────────────────────────────────────────────────

type ChoiceCardProps = {
  image: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  tag: string;
  onPress: () => void;
};

const ChoiceCard = ({ image, icon, title, subtitle, tag, onPress }: ChoiceCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className="flex-1 rounded-[15px] overflow-hidden"
  >
    <ImageBackground
      source={{ uri: image }}
      resizeMode="cover"
      className="flex-1"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View className="flex-1 justify-between p-5">
        {/* Top row */}
        <View className="flex-row items-start justify-between">
          <View className="w-12 h-12 rounded-2xl bg-white/25 items-center justify-center">
            <Ionicons name={icon} size={22} color="white" />
          </View>
          <View className="bg-white/20 rounded-full px-3 py-1.5">
            <Text className="text-[10px] font-bold text-white uppercase tracking-widest">
              {tag}
            </Text>
          </View>
        </View>

        {/* Bottom copy */}
        <View>
          <Text className="text-[24px] font-[Crispy] text-white mb-1.5">
            {title}
          </Text>
          <Text className="text-[13px] text-white/85 font-[Nunito-regular] leading-5 mb-4 max-w-[85%]">
            {subtitle}
          </Text>
          <View className="flex-row items-center self-start bg-white rounded-full pl-4 pr-2.5 py-2">
            <Text className="text-[13px] font-[Nunito-bold] text-zinc-900 mr-2">
              Get started
            </Text>
            <View className="w-5 h-5 rounded-full bg-orange-500 items-center justify-center">
              <Ionicons name="arrow-forward" size={12} color="white" />
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  </TouchableOpacity>
);

// ─── Main Component ──────────────────────────────────────────────────────

const ChooseCreateType = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      {/* ── Header ── */}

      <View className="mx-6 mt-4  w-[300px] pb-6">
        <Image source={images.launch} tintColor={'white'}  className="w-[15px] z-1 h-[15px] bottom-[22px] absolute right-[85px]  " />
       <Text className="text-[16px] z-2  leading-[24px] w-[230px] tracking-widest text-left font-[Crispy]" style={{color: color.morange}}>
  What kind of{' '}
  <View className="border-b-[1px] border-green-500 pb-[1px] translate-y-[4px]">
    <Text className="text-green-500 z-3 font-[Crispy]">brand</Text> 
  </View>
  {' '}are you building? 
</Text>

       
      </View>

      {/* ── Choices ── */}
      <View className="flex-1 px-5 pb-4 gap-4">
        <ChoiceCard
          image="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
          icon="storefront-outline"
          title="Open a Store"
          subtitle="Sell food, drinks, or products with a menu customers can order from."
          tag="Sell products"
          onPress={() => router.push("/CreateStore")}
        />
        <ChoiceCard
          image="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop"
          icon="sparkles-outline"
          title="Start a Gig"
          subtitle="Offer a skill — braiding, tutoring, repairs, and more — on your own schedule."
          tag="Offer a skill"
          onPress={() => router.push("/CreateEvent")}
        />
      </View>

      <Text className="text-center text-[11px] text-zinc-400 mb-5 px-8">
        You can always add the other later — most people end up doing both.
      </Text>
    </SafeAreaView>
  );
};

export default ChooseCreateType;