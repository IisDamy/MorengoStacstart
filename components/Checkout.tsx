import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { createOrder } from '@/lib/appwrite';
import { color } from '@/constants';
import { useCartStore } from '@/store/cart.auth.store';
import {
  formatNaira,
  nairaToKobo,
  calcPlatformFee,
} from '@/constants/utils';
import useAuthStore from '@/store/auth.store';
import { useState } from 'react';
import { router } from 'expo-router';
import { useCordsStore } from '@/store/coords.store';
import LocationSelectorModal from '@/components/LocationSelectorModal';
import { CustomInput, CustomButton } from '@/components';
import { getCurrentLocation } from '@/lib/utils';

const DELIVERY_FEE = 400;

const CheckoutSummary = () => {
  const { user } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { locations, location, saveLocation } = useCordsStore();

  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [changeLocation, toggleChangeLocation] = useState(false);
  const [addressDraft, setAddressDraft] = useState(location?.description || '');
  const [editingAddress, setEditingAddress] = useState(false);

  const itemTotal = getTotalPrice();
  const discount = user?.points === 500 ? Math.min(0.15 * itemTotal, 400) : 0;
  const platformFee = calcPlatformFee(itemTotal);
  const total = Math.max(itemTotal - discount, 0) + platformFee + DELIVERY_FEE;

  const hasCoords = !!location?.coords;
  const hasDescription = !!location?.description?.trim();
  const locationComplete = hasCoords && hasDescription;

  // Step 1: pull device coordinates via expo-location
  const handleGetLocation = async () => {
    if (gettingLocation) return;
    setGettingLocation(true);
    try {
      const coords = await getCurrentLocation();
      if (!coords) throw new Error('Could not read your location');
      saveLocation?.({
        ...location,
        coords,
        description: location?.description || '',
      });
      setEditingAddress(true); // prompt for the written description next
    } catch (e) {
      console.error(e);
      Alert.alert(
        'Location unavailable',
        'We couldn\u2019t get your location. Please enable location access and try again.'
      );
    } finally {
      setGettingLocation(false);
    }
  };

  // Step 2: save the written description that goes with those coordinates
  const handleSaveAddress = () => {
    if (!addressDraft.trim()) {
      Alert.alert('Add a description', 'Tell us how to find you \u2014 e.g. "Blue gate, opposite the pharmacy".');
      return;
    }
    saveLocation({ ...location, description: addressDraft.trim() });
    setEditingAddress(false);
  };

  const handleCheckoutPress = () => {
    if (items.length === 0 || loading) return;

    if (!hasCoords) {
      handleGetLocation();
      return;
    }
    if (!hasDescription) {
      setEditingAddress(true);
      return;
    }
    checkout();
  };

  const checkout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await createOrder({
        customerId: user?.$id,
        items,
        subtotal: itemTotal,
        subtotalKobo: nairaToKobo(itemTotal),
        totalKobo: nairaToKobo(total),
        customerName: user?.name,
        userAddress: JSON.stringify({
          location: location.coords,
          description: location.description,
        }),
      });

      if (!res) throw new Error('Failed to create order');
      clearCart();
    } catch (e) {
      console.error(e);
      Alert.alert('Something went wrong', 'We couldn\u2019t place your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* everything below stays compact so checkout never drifts far down.
         while editing the address, this area grows to fill the leftover
         space so the textarea gets real room to breathe. */}
      <View className={`pb-10 ${editingAddress ? 'flex-1' : ''}`}>
        {/* order summary */}
        <View className="border-t border-zinc-100 pt-2">
          <View className="flex-row w-full justify-between py-0.5">
            <Text className="text-sm font-[Nunito-bold]">Item Total</Text>
            <Text className="text-sm font-[Nunito-bold]">{formatNaira(itemTotal)}</Text>
          </View>

          {discount > 0 && (
            <View className="flex-row justify-between py-0.5">
              <Text className="text-xs font-[Nunito-regular] text-green-500">Discount</Text>
              <Text className="text-xs font-[Nunito-regular] text-green-500">
                -{formatNaira(discount)}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between py-0.5">
            <Text className="text-xs font-[Nunito-regular] text-zinc-500">Delivery Fee</Text>
            <Text className="text-xs font-[Nunito-regular] text-zinc-500">
              {formatNaira(DELIVERY_FEE)}
            </Text>
          </View>

          <View className="flex-row justify-between py-0.5">
            <Text className="text-xs font-[Nunito-regular] text-zinc-500">Platform Fee</Text>
            <Text className="text-xs font-[Nunito-regular] text-zinc-500">
              {formatNaira(platformFee)}
            </Text>
          </View>

          <View className="flex-row mt-1 py-2.5 border-b border-zinc-300 border-t w-full justify-between">
            <Text className="text-base font-[Nunito-extraBold]" style={{ color: color.moregreen }}>
              TOTAL
            </Text>
            <Text className="text-base font-[Nunito-extraBold]" style={{ color: color.moregreen }}>
              {formatNaira(total)}
            </Text>
          </View>
        </View>

        {/* delivery location — one compact row, or a full editing card */}
        <View className={`w-full my-3 ${editingAddress ? 'flex-1' : ''}`}>
          {editingAddress ? (
            <View className="w-full flex-1 gap-2 rounded-[12] border border-zinc-200 p-3">
              <Text className="font-[Nunito-semiBold] text-sm">Describe your address</Text>
              <CustomInput
                value={addressDraft}
                onChangeText={setAddressDraft}
                placeholder='e.g. "Blue gate, opposite the pharmacy, third floor"'
                multiline
                plain
                fill
              />
              <View className="flex-row gap-2">
                <CustomButton
                  title="Save"
                  onPress={handleSaveAddress}
                  style={{ backgroundColor: color.moregreen, flex: 1, height: 40 }}
                />
                {hasDescription && (
                  <TouchableOpacity
                    onPress={() => {
                      setAddressDraft(location.description);
                      setEditingAddress(false);
                    }}
                    className="justify-center px-3"
                  >
                    <Text className="font-[Nunito-bold] text-sm text-zinc-400">Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => (!hasCoords ? handleGetLocation() : toggleChangeLocation(true))}
              className="flex-row items-center justify-between rounded-[12] border border-zinc-200 px-3 py-2.5"
            >
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="h-9 w-9 rounded-full bg-zinc-100 items-center justify-center">
                  {gettingLocation ? (
                    <ActivityIndicator size="small" color={color.moregreen} />
                  ) : (
                    <Text className="text-base">📍</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-[Nunito-bold] text-sm">
                    {locationComplete
                      ? location?.label || 'Deliver here'
                      : gettingLocation
                      ? 'Getting your location...'
                      : 'Add delivery location'}
                  </Text>
                  <Text className="text-xs font-[Nunito-regular] text-zinc-500" numberOfLines={1}>
                    {locationComplete ? location.description : 'Required before checkout'}
                  </Text>
                </View>
              </View>
              <Text className="font-[Nunito-bold] text-sm" style={{ color: color.moregreen }}>
                {locationComplete ? 'Change' : 'Add'}
              </Text>
            </Pressable>
          )}
        </View>

        { (
          <Pressable
            onPress={handleCheckoutPress}
            disabled={loading}
            className="h-16 rounded-[15] w-full"
            style={{
              backgroundColor: locationComplete ? color.moregreen : '#a1a1aa',
            }}
          >
            <View className="flex-row items-center justify-around h-full w-full">
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-[Nunito-bold] border-r pr-5 border-white">
                    {locationComplete ? 'Checkout' : 'Add location to checkout'}
                  </Text>
                  {locationComplete && (
                    <Text className="text-white font-[Nunito-bold]">{formatNaira(total)}</Text>
                  )}
                </>
              )}
            </View>
          </Pressable>
        )}
      </View>

      <LocationSelectorModal
        open={changeLocation}
        onClose={() => toggleChangeLocation(false)}
        onNavigate={() => router.push('/(tabs)/location')}
        locations={locations}
      />
    </>
  );
};

export default CheckoutSummary;