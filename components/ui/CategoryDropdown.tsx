import {useState} from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { CATEGORIES } from '@/constants'


const CategoryDropdown = ({
  selected,
  onSelect,
}: {
  selected: string[]
  onSelect: (cats: string[]) => void
}) => {
  const [open, setOpen] = useState(false)

  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onSelect(selected.filter((c) => c !== cat))
    } else {
      onSelect([...selected, cat])
    }
  }

  return (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4 justify-between"
      >
        <Text className={`text-[14px] font-[Nunito-regular] ${selected.length ? 'text-zinc-800' : 'text-zinc-400'}`}>
          {selected.length ? selected.join(', ') : 'Select categories'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
      </TouchableOpacity>

      {/* Selected chips */}
      {selected.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-2">
          {selected.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => toggle(cat)}
              className="flex-row items-center bg-orange-50 border border-orange-200 rounded-full px-3 py-1 gap-1"
            >
              <Text className="text-[12px] text-orange-600 font-semibold">{cat}</Text>
              <Ionicons name="close-circle" size={13} color="#f97316" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpen(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[17px] font-[Nunito-bold] text-zinc-800">Pick categories</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#71717a" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.name}
              numColumns={2}
              columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
              renderItem={({ item: cat }) => {
                const isSelected = selected.includes(cat.name)
                return (
                  <TouchableOpacity
                    onPress={() => toggle(cat.name)}
                    className={`flex-1 rounded-xl py-3 px-3 border flex-row items-center gap-2 ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-[Nunito-semibold] flex-1 ${
                        isSelected ? 'text-white' : 'text-zinc-700'
                      }`}
                    >
                      {cat.name}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                  </TouchableOpacity>
                )
              }}
            />
            <TouchableOpacity
              onPress={() => setOpen(false)}
              className="bg-orange-500 rounded-2xl h-[52px] items-center justify-center mt-2"
            >
              <Text className="text-white font-[Nunito-bold] text-[15px]">Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}


export default CategoryDropdown