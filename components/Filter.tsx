import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    Animated,

} from 'react-native';
import React, { useRef as useReactRef, useEffect as useReactEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { BlurView } from 'expo-blur';

const CATEGORIES = [
    { label: 'All', emoji: '✦' },
    { label: 'Recent', emoji: '🕐' },
    { label: 'Local', emoji: '📍' },
    { label: 'Fastfood', emoji: '🍔' },
    { label: 'Favourite', emoji: '❤️' },
    { label: 'Popular', emoji: '🔥' },
    { label: 'Restaurant', emoji: '🍽️' },
    { label: 'Bakery', emoji: '🥐' },
];

const Filter = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const searchParams = useLocalSearchParams();
    const [active, setActive] = useState<string>(
        (searchParams.category as string) || 'All'
    );
    const slideAnim = useReactRef(new Animated.Value(300)).current;
    const fadeAnim = useReactRef(new Animated.Value(0)).current;

    useReactEffect(() => {
        if (open) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    damping: 20,
                    stiffness: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 300,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [open]);

    const handlePress = (category: string) => {
        setActive(category);
        router.setParams({ category });
        onClose();
    };

    return (
        <Modal
            visible={open}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Backdrop */}
            <Animated.View
                style={{ flex: 1, opacity: fadeAnim }}
                className="bg-black/40"
            >   
                <Pressable style={{ flex: 1 }} onPress={onClose} />

                {/* Sheet */}
                <Animated.View
                    style={{ transform: [{ translateY: slideAnim }] }}
                    className="bg-white rounded-t-[28px] px-6 pt-5 pb-14"
                >
                    {/* Handle */}
                    <View className="w-10 h-1 rounded-full bg-zinc-200 self-center mb-5" />

                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text
                            style={{ fontFamily: 'Nunito-Bold' }}
                            className="text-xl text-zinc-800"
                        >
                            Filter by Category
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center"
                        >
                            <Text className="text-zinc-500 text-base leading-none">✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Category pills grid */}
                    <View className="flex-row flex-wrap gap-3">
                        {CATEGORIES.map(({ label, emoji }) => {
                            const isActive = active === label;
                            return (
                                <TouchableOpacity
                                    key={label}
                                    onPress={() => handlePress(label)}
                                    activeOpacity={0.75}
                                    className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full border ${
                                        isActive
                                            ? 'bg-amber-400 border-amber-400'
                                            : 'bg-white border-zinc-200'
                                    }`}
                                    style={
                                        isActive
                                            ? {
                                                  shadowColor: '#f59e0b',
                                                  shadowOffset: { width: 0, height: 3 },
                                                  shadowOpacity: 0.35,
                                                  shadowRadius: 6,
                                                  elevation: 4,
                                              }
                                            : {}
                                    }
                                >
                                    <Text className="text-sm">{emoji}</Text>
                                    <Text
                                        style={{ fontFamily: 'Nunito-SemiBold' }}
                                        className={`text-sm ${
                                            isActive ? 'text-white' : 'text-zinc-600'
                                        }`}
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Active label */}
                    {active ? (
                        <View className="mt-6 flex-row items-center gap-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <Text
                                style={{ fontFamily: 'Nunito-Regular' }}
                                className="text-sm text-zinc-400"
                            >
                                Showing results for{' '}
                                <Text
                                    style={{ fontFamily: 'Nunito-Bold' }}
                                    className="text-zinc-700"
                                >
                                    {active}
                                </Text>
                            </Text>
                        </View>
                    ) : null}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default Filter;