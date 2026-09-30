import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  Linking,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { color, animations, images } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  useAnimatedStyle,
  Easing,
  useAnimatedRef,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import useAuthStore from '@/store/auth.store';
import Background from '@/components/ui/Background';
import AIChatModal from '@/components/ChatModal';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Replace the urls with your real handles
const SOCIALS: { id: string; icon: IconName; label: string; url: string; bg: string }[] = [
  { id: 'instagram', icon: 'logo-instagram', label: 'Instagram', url: 'https://instagram.com/yourhandle', bg: '#E1306C' },
  { id: 'whatsapp', icon: 'logo-whatsapp', label: 'WhatsApp', url: 'https://wa.me/234XXXXXXXXXX', bg: '#25D366' },
  { id: 'x', icon: 'logo-twitter', label: 'X', url: 'https://x.com/yourhandle', bg: '#14171A' },
  { id: 'tiktok', icon: 'logo-tiktok', label: 'TikTok', url: 'https://tiktok.com/@yourhandle', bg: '#FE2C55' },
];

// Shared "glass" look for the secondary cards so they sit well next to the dark hero image
const glassCard = {
  backgroundColor: 'rgba(0,0,0,0.28)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.25)',
} as const;

const Dashboard = () => {
  const { user } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [sparkleFinish, setSparkleFinish] = useState(false);
  const [whatIs] = useState(false);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);

  // reanimated
  const rotate = useSharedValue(0);
  const offset = useSharedValue(-150);
  const fabScale = useSharedValue(1);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const smileyRef = useRef<LottieView>(null);
  const sparkleRef = useRef<LottieView>(null);

  const ConnectAnimatedStyles = useAnimatedStyle(() => ({
    display: offset.value === -150 ? 'none' : 'flex',
    transform: [{ translateY: offset.value }],
  }));

  const SmileyAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const FabAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  useEffect(() => {
    offset.value = withTiming(isOpen ? 0 : -150, {
      duration: isOpen ? 500 : 300,
      easing: Easing.inOut(Easing.poly(4)),
    });
  }, [isOpen]);

  // smiley
  useEffect(() => {
    const t = setTimeout(() => sparkleRef.current?.play(), 600);
    const interval = setInterval(() => {
      rotate.value = withTiming(rotate.value + 360, { duration: 1000 });
      smileyRef.current?.play();
    }, 30000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  const openLink = (url: string) => Linking.openURL(url).catch(() => {});

  const socialRows = [SOCIALS.slice(0, 2), SOCIALS.slice(2, 4)];

  return (
    <View className={`bg-[#57a886] flex items-center h-screen`}>
      <LinearGradient
        className="w-full absolute top-20 h-full"
        colors={['#57a886', color.morange]}
      />

      {!whatIs ? (
        <View className="flex items-center w-full">
          <Background />

          {/* header */}
          <View
            className="flex px-6 py-4 w-full items-center flex-row justify-between"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
          >
            <View
              className="border p-4 pr-8 rounded-2xl"
              style={{ borderColor: color.dashboard }}
            >
              <Text style={{ color: color.dashboard }}>Dashboard</Text>
            </View>
            <View>
              <Text
                className="text-2xl"
                style={{
                  fontFamily: 'Crispy',
                  color: color.morange,
                  letterSpacing: 0,
                  textShadowColor: 'white',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 0.1,
                }}
              >
                MORENGO
              </Text>
            </View>
          </View>

          {/* ScrollView */}
          <Animated.ScrollView
            className="px-6 w-full"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            ref={scrollRef}
          >
            <Text
              className="w-full h-5 font-bold "
              style={{ color: color.dashboard }}
            >
              Welcome {user?.name}
            </Text>
            <Text
              className="mb-12 pt-4"
              style={{ color: color.dashboard, lineHeight: 25 }}
            >
              What can we do to make your day
              <TouchableOpacity
                onPress={() => setIsAiModalVisible(true)}
                className="self-center"
              >
                <Text className="text-green-400 font-[Nunito-bold] relative top-[5px]"> more </Text>
              </TouchableOpacity>
              convenient?
            </Text>

            {/* smiley */}
            <Animated.View
              className="w-fit h-fit"
              style={[{ position: 'absolute', top: 50, left: 70 }, SmileyAnimatedStyles]}
            >
              <LottieView
                ref={smileyRef}
                style={{ width: 38, height: 38 }}
                progress={1}
                autoPlay={true}
                loop={false}
                source={animations.smiley}
              />
            </Animated.View>

            {/* Body: one primary action, two secondary actions */}
            <View className="w-full" style={{ gap: 12 }}>
              {/* Primary: manage your brands */}
              <TouchableOpacity
                activeOpacity={0.85}
                className="w-full h-44 rounded-3xl overflow-hidden"
                onPress={() => router.push('/(screens)/Manage')}
              >
                <ImageBackground
                  source={images.dashboardManage}
                  style={{ flex: 1 }}
                  resizeMode="cover"
                >
                  {/* dark tint, heavier at the bottom where the text sits */}
                  <LinearGradient
                    colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.7)']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  />
                  <View className="flex-1 p-5 justify-between">
                    <View
                      className="self-start w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <Ionicons name="storefront-outline" size={20} color="white" />
                    </View>
                    <View className="flex-row items-end justify-between">
                      <View>
                        <Text
                          className="text-2xl"
                          style={{ fontFamily: 'Crispy', color: 'white' }}
                        >
                          manage your brands
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.75)' }} className="mt-1">
                          Add, edit and organise your brands
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward" size={22} color="white" />
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              {/* Secondary: check orders + open morengo */}
              <View className="flex-row" style={{ gap: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="flex-1 h-28 rounded-3xl p-4 justify-between"
                  style={glassCard}
                  onPress={() => router.push('/OrderDelivery')}
                >
                  <Ionicons name="receipt-outline" size={24} color="white" />
                  <Text style={{ fontFamily: 'Crispy', color: 'white' }} className="text-lg">
                    check orders
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  className="flex-1 h-28 rounded-3xl p-4 justify-between"
                  style={glassCard}
                  onPress={() => router.push('/')}
                >
                  <Ionicons name="compass-outline" size={24} color="white" />
                  <Text style={{ fontFamily: 'Crispy', color: 'white' }} className="text-lg">
                    open morengo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* body end */}
            <View
              className="mt-8 pt-12 pb-1 flex overflow-hidden justify-start"
              style={{ zIndex: 3 }}
            >
              {!sparkleFinish && (
                <LottieView
                  ref={sparkleRef}
                  source={animations.sparkle}
                  onAnimationFinish={() => setSparkleFinish(true)}
                  loop={false}
                  style={{
                    width: 200,
                    height: 100,
                    position: 'absolute',
                    left: 60,
                    top: 55,
                    zIndex: 3,
                  }}
                />
              )}

              <View className="gap-2 flex items-center">
                <View className="w-[90%] bg-black h-[1px]"></View>
                <View className="w-[80%] bg-black h-[1px]"></View>
                <View className="w-[60%] bg-black h-[1px]"></View>
                <View className="w-[50%] bg-black h-[1px]"></View>
              </View>

              <View className="py-8 ">
                <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
                  <Text className="tracking-[5px] w-full text-center ">Connect with us</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Connect section: 2x2 social tiles */}
            <View className="border border-transparent mb-60 overflow-hidden">
              <Animated.View
                className="self-center relative p-2 w-52 h-52"
                style={[{ display: 'none', gap: 8 }, ConnectAnimatedStyles]}
              >
                {socialRows.map((row, i) => (
                  <View key={i} className="flex-row flex-1" style={{ gap: 8 }}>
                    {row.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.7}
                        accessibilityRole="link"
                        accessibilityLabel={s.label}
                        className="flex-1 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: s.bg }}
                        onPress={() => openLink(s.url)}
                      >
                        <Ionicons name={s.icon} size={30} color="white" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </Animated.View>
            </View>
          </Animated.ScrollView>

          {/* AI assistant button */}
          <View className="w-72 h-24 flex-row absolute justify-center items-center bottom-28">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open AI assistant"
              onPressIn={() => (fabScale.value = withSpring(0.92))}
              onPressOut={() => (fabScale.value = withSpring(1))}
              onPress={() => setIsAiModalVisible(true)}
            >
              <Animated.View
                className="w-[88px] h-[88px] rounded-full items-center justify-center"
                style={[{ backgroundColor: 'rgba(255,255,255,0.25)' }, FabAnimatedStyles]}
              >
                {/* raised button face */}
                <View
                  className="w-[72px] h-[72px] rounded-full overflow-hidden"
                  style={{
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.7)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                    elevation: 10,
                  }}
                >
                  <LinearGradient
                    colors={['#fb923c', '#ea580c']}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Image
                      source={images.morengologo}
                      resizeMode="contain"
                      className="w-10 h-10"
                      tintColor="white"
                    />
                  </LinearGradient>
                </View>

                {/* small badge hints that it opens the AI chat */}
                <View
                  className="absolute top-1 right-1 w-7 h-7 rounded-full items-center justify-center bg-white"
                  style={{ elevation: 11 }}
                >
                  <Ionicons name="sparkles" size={14} color="#ea580c" />
                </View>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      ) : (
        <View></View>
      )}

      {/* AI Chatbox Modal */}
      <AIChatModal
        visible={isAiModalVisible}
        onClose={() => setIsAiModalVisible(false)}
        userName={user?.name}
      />
    </View>
  );
};

export default Dashboard;