import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'


 const SwipeToCancel = ({ children, onSwipe }: { children: React.ReactNode; onSwipe: () => void }) => {
  const translateX = useSharedValue(0)

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX
      }
    })
    .onEnd((e) => {
      if (e.translationX < -50 ) {
        translateX.value = withSpring(0, { damping: 20, stiffness: 100 }, () => {
          scheduleOnRN(onSwipe)
        })
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 100 })
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  )
}


export default SwipeToCancel