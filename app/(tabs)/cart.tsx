import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '@/constants';
import { useCartStore } from '@/store/cart.auth.store';
import { buildOrderString, formatNaira } from '@/constants/utils';
import { TabsHeader } from '@/components';
import CheckoutSummary from '@/components/Checkout';

const cart = () => {
  const { items, increaseQty, decreaseQty } = useCartStore();

  return (
    <SafeAreaView className="bg-white h-full overflow-visible w-full flex">
      {/* KeyboardAvoidingView wraps the header too, and uses an explicit style
         (not just className) so its flex:1 is guaranteed to apply — nativewind
         className flex sometimes doesn't get picked up in time on this component. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View className="px-6 flex-1">
          <TabsHeader tabName="Cart" />

          {items.length > 0 ? (
            <View className="w-full flex-1 items-center">
              <View className="w-full flex-1">
                {/* cart items */}
                <ScrollView className="h-[38%] overflow-hidden" showsVerticalScrollIndicator={true}>
                  {items?.map((item, idx) => (
                    <View
                      className="w-full flex-row gap-4 p-1 border-b border-zinc-200 py-4"
                      key={`${item.$id}-${idx}`}
                    >
                      <Image className="rounded-[10] h-24 w-24" source={{ uri: item.image }} />

                      <View className="flex gap-2 w-full">
                        <Text className="text-[14px] w-[230] font-[Nunito-bold]">
                          {buildOrderString(item, item.modifierOptions)}
                        </Text>

                        <View className="flex-row items-center w-[200] justify-between">
                          <View className="flex-col gap-2">
                            <Text className="font-[Nunito-semiBold] text-[12px]">
                              {item.vendors.name}
                            </Text>
                            <Text
                              className="text-[14px] font-[Nunito-bold]"
                              style={{ color: color.moregreen }}
                            >
                              {formatNaira(
                                item.price +
                                  item.modifierOptions?.reduce(
                                    (sum, item) => sum + (item.price * item.qty || 0),
                                    0
                                  )
                              )}
                            </Text>
                          </View>

                          <View className="border border-zinc-200 rounded-[8] py-2 w-[78] justify-around flex-row">
                            <TouchableOpacity
                              className="h-full w-[35%]"
                              onPress={() => decreaseQty(item.id, item.modifierOptions)}
                            >
                              <Text className="font-[Nunito-bold] text-center text-red-400">-</Text>
                            </TouchableOpacity>

                            <Text className="font-[Nunito-bold]">{item.quantity}</Text>

                            <TouchableOpacity
                              className="w-[35%] h-full"
                              onPress={() => increaseQty(item.id, item.modifierOptions)}
                            >
                              <Text className="font-[Nunito-bold] text-green-500 text-center">+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <CheckoutSummary />
              </View>
            </View>
          ) : (
            <Text className="self-center my-auto font-[Crispy] tracking-tighter text-lg text-green-500 text-[16px] rotate-[-10deg] bg-white">
              YOUR CART IS EMPTY
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default cart;