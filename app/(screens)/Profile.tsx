// app/(screens)/ProfileEdit.tsx (adjust path as needed)
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Back from '@/components/Back'
import { SafeAreaView } from 'react-native-safe-area-context'
import useAuthStore from '@/store/auth.store'
import { router } from 'expo-router'
import { refreshAuthStore, updateUser } from '@/lib/appwrite'
import ImagePickerD from '@/components/ImagePicker'

const FIELDS = [
  { key: 'name', label: 'Full name', keyboardType: 'default' as const },
  { key: 'email', label: 'Email', keyboardType: 'email-address' as const },
  { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' as const },
  { key: 'institution', label: 'Institution', keyboardType: 'default' as const },
]

const ProfileEdit = () => {
  const { user } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  const [image, setImage] = useState<string | null>(user?.avatar ?? null)
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    institution: user?.institution ?? '',
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateUser({
        userId: user?.$id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        institution: form.institution,
        avatar: image, // local device path, saved as-is
      })

      if (!result) throw new Error('Update failed')

      await refreshAuthStore()
      router.back()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Back />
        <Text className="font-semibold text-lg">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text className="font-semibold text-base text-blue-500">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="items-center mt-6 mb-4">
        <ImagePickerD image={image} setImage={setImage} />
      </View>

      <View className="px-6">
        <View
          className="bg-white rounded-2xl px-4"
          style={{
            shadowColor: '#1a1a1a',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {FIELDS.map((field, idx) => (
            <View
              key={field.key}
              className={`py-3 ${idx !== FIELDS.length - 1 ? 'border-b border-zinc-100' : ''}`}
            >
              <Text className="text-xs text-zinc-400 mb-1">{field.label}</Text>
              <View className="flex-row items-center justify-between">
                <TextInput
                  value={form[field.key as keyof typeof form]}
                  onChangeText={(text) => setForm({ ...form, [field.key]: text })}
                  keyboardType={field.keyboardType}
                  className="flex-1 text-base text-zinc-900 py-0"
                  placeholder={field.label}
                  placeholderTextColor="#C2C2CB"
                />
                <MaterialIcons name="mode-edit-outline" size={18} color="#C2C2CB" />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(screens)/ResetPassword')}
          className="bg-white rounded-2xl px-4 py-4 mt-4 flex-row items-center justify-between"
          style={{
            shadowColor: '#1a1a1a',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View>
            <Text className="text-xs text-zinc-400 mb-1">Password</Text>
            <Text className="text-base text-zinc-900">••••••••</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#C2C2CB" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default ProfileEdit