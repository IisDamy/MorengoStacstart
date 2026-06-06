import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'



const LocationDropdown = ({
  locations,
  selected,
  onSelect,
  onNavigate,
}: {
  locations: { coords: number[]; label: string }[]
  selected: string | null
  onSelect: (label: string) => void
  onNavigate: () => void
}) => {
  const [open, setOpen] = useState(false)
  const isEmpty = locations.length < 1

  const handlePress = () => {
    if (isEmpty) {
      Alert.alert(
        'No locations saved',
        'You need to save a location before setting your store address.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add location', onPress: onNavigate },
        ]
      )
      return
    }
    setOpen(true)
  }

  return (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.75}
        className={`border rounded-2xl h-[52px] flex-row items-center px-4 justify-between ${
          isEmpty ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-100 border-zinc-200'
        }`}
      >
        <View className="flex-row items-center gap-2 flex-1">
          <Ionicons
            name="location-outline"
            size={16}
            color={isEmpty ? '#d4d4d8' : selected ? '#f97316' : '#9ca3af'}
          />
          <Text
            className={`text-[14px] flex-1 font-[Nunito-regular] ${
              isEmpty ? 'text-zinc-300' : selected ? 'text-zinc-800' : 'text-zinc-400'
            }`}
            numberOfLines={1}
          >
            {isEmpty ? 'No locations saved yet' : selected ?? 'Select a location'}
          </Text>
        </View>
        {isEmpty ? (
          <View className="flex-row items-center gap-1">
            <Text className="text-[11px] text-orange-400 font-[Nunito-semibold]">Add first</Text>
            <Ionicons name="arrow-forward" size={13} color="#f97316" />
          </View>
        ) : (
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
        )}
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpen(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-14">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[17px] font-[Nunito-bold] text-zinc-800">Choose location</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#71717a" />
              </TouchableOpacity>
            </View>
            {locations.map((loc) => {
              const isActive = selected === loc.label
              return (
                <TouchableOpacity
                  key={loc.label}
                  onPress={() => {
                    onSelect(loc.label)
                    setOpen(false)
                  }}
                  className={`flex-row items-center gap-3 p-4 rounded-2xl mb-2 border ${
                    isActive
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-zinc-50 border-zinc-100'
                  }`}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isActive ? 'bg-orange-500' : 'bg-zinc-200'
                    }`}
                  >
                    <Ionicons
                      name="location"
                      size={14}
                      color={isActive ? 'white' : '#71717a'}
                    />
                  </View>
                  <Text
                    className={`flex-1 text-[14px] font-[Nunito-semibold] ${
                      isActive ? 'text-orange-600' : 'text-zinc-700'
                    }`}
                    numberOfLines={1}
                  >
                    {loc.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark-circle" size={18} color="#f97316" />}
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity
              onPress={() => {
                setOpen(false)
                onNavigate()
              }}
              className="flex-row items-center gap-2 mt-1 p-3 justify-center"
            >
              <Ionicons name="add-circle-outline" size={16} color="#f97316" />
              <Text className="text-[13px] text-orange-500 font-[Nunito-semibold]">Save a new location</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default LocationDropdown