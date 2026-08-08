import Animated, { useSharedValue, useAnimatedStyle,withSpring, withTiming } from 'react-native-reanimated'
import { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { color } from '@/constants'

interface TabSwitcherProps {
  stages: string[]
  activeGroup: string
  onChange: (group: string) => void
}

const TabSwitcher = ({ stages, activeGroup, onChange }: TabSwitcherProps) => {
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({})

  const bubbleX = useSharedValue(0)
  const bubbleWidth = useSharedValue(0)

useEffect(() => {
  const layout = layouts[activeGroup]
  if (layout) {
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
    bubbleX.value = withSpring(layout.x, springConfig)
    bubbleWidth.value = withSpring(layout.width, springConfig)
  }
}, [activeGroup, layouts])
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleX.value }],
    width: bubbleWidth.value,
  }))

  return (
    <View className='w-full mb-8 mt-8 pb-3'>
      <View className='flex-row w-full justify-between'>
        <Animated.View
          pointerEvents='none'
          className='absolute border py-2 rounded-full'
          style={[
            {   
            borderColor:color.moregreen,
              height: 26,
              top: 0,
              backgroundColor: '#f7f1e9',
            },
            bubbleStyle,
          ]}
        />
        {stages.map((group, index) => (
          <Pressable
            key={index}
            onPress={() => onChange(group)}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout
              setLayouts((prev) => ({ ...prev, [group]: { x, width } }))
            }}
            className='px-3 py-1.5 z-10'
          >
            <Text
              className='font-[Nunito-bold]  uppercase'
              style={{ color: activeGroup === group ? color.moregreen : '#404a3854', fontSize: 10 }}
            >
              {group}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export default TabSwitcher