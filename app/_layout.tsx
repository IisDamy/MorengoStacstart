import { Stack, useRouter } from "expo-router"; // add useRouter
import './globals.css'
import * as Sentry from '@sentry/react-native';
import { useFonts } from "expo-font";
import { useEffect } from "react";
import useAuthStore from "@/store/auth.store";
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from 'expo-notifications';
import { usePushToken } from "@/hooks/usePushTarget";


// Set handler OUTSIDE the component
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

Sentry.init({
  dsn: 'https://091d6dc0e833f31b86fe46c82e15794d@o4510487902027776.ingest.us.sentry.io/4510726290800640',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

export default Sentry.wrap(function RootLayout() {
  const router = useRouter(); // add this
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Crispy": require("../assets/fonts/Crispy.otf"),
    "Nunito": require("../assets/fonts/Nunito.ttf"),
    "Nunito-semiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-regular": require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-light": require("../assets/fonts/Nunito-Light.ttf"),
    "Nunito-medium": require("../assets/fonts/Nunito-Medium.ttf"),
    "Nunito-extraBold": require("../assets/fonts/Nunito-ExtraBold.ttf"),
    "Nunito-black": require("../assets/fonts/Nunito-Black.ttf"),

  });
  const { isLoading, fetchAuthenticatedUser, user, setIsAuthenticated } = useAuthStore();

  

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  useEffect(() => {
    if (!user) fetchAuthenticatedUser()
  }, []);

 
  usePushToken(user?.$id) 

  // Notification tap listener
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { orderId, status } = response.notification.request.content.data;
      if (orderId) router.push('/(tabs)/orders') // navigate to order details page
    });
    return () => subscription.remove(); // cleanup on unmount
  }, [user]);

  if (isLoading || !fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
});