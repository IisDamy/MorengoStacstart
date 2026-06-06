import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import { color } from '@/constants'

// ─── Types ───────────────────────────────────────────────────────────────────

type TransportType = 'bicycle' | 'motorcycle' | 'car' | 'on_foot'
type AvailabilityDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pickImage = async (aspect: [number, number] = [1, 1]): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to your photo library.')
    return null
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect,
    quality: 0.85,
  })
  if (!result.canceled && result.assets[0]) return result.assets[0].uri
  return null
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionLabel = ({ label, sub }: { label: string; sub?: string }) => (
  <View className="mb-3">
    <Text className="text-[14px] font-[Nunito-bold] text-zinc-800 tracking-wide">{label}</Text>
    {sub && <Text className="text-[12px] text-zinc-400 mt-1 font-[Nunito-regular]">{sub}</Text>}
  </View>
)

const SectionDivider = ({ title }: { title: string }) => (
  <View className="flex-row items-center gap-3 my-5">
    <View className="flex-1 border-t border-zinc-100" />
    <View className="bg-orange-50 rounded-full px-3 py-1">
      <Text className="text-[11px] font-[Nunito-bold] text-orange-500 uppercase tracking-widest">
        {title}
      </Text>
    </View>
    <View className="flex-1 border-t border-zinc-100" />
  </View>
)

const FieldInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
  autoCapitalize = 'sentences',
}: {
  icon: string
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'number-pad'
  secureTextEntry?: boolean
  maxLength?: number
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}) => (
  <View className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4">
    <Ionicons name={icon as any} size={16} color="#f97316" />
    <TextInput
      className="flex-1 ml-2 text-zinc-800 text-[14px] font-[Nunito-regular]"
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
    />
  </View>
)

const UploadBox = ({
  uri,
  onPress,
  icon,
  label,
  sublabel,
  badge,
  aspect = [1, 1] as [number, number],
  wide = false,
}: {
  uri: string | null
  onPress: () => void
  icon: string
  label: string
  sublabel?: string
  badge?: string
  aspect?: [number, number]
  wide?: boolean
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <View
      className={`rounded-[24px] bg-zinc-100 border-2 border-dashed border-zinc-300 items-center justify-center overflow-hidden ${
        wide ? 'w-full h-[140px]' : 'w-[110px] h-[110px]'
      }`}
    >
      {uri ? (
        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="items-center gap-1 px-3">
          <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
            <Ionicons name={icon as any} size={20} color="#f97316" />
          </View>
          <Text className="text-[11px] text-zinc-500 font-[Nunito-semibold] text-center">{label}</Text>
          {sublabel && (
            <Text className="text-[10px] text-zinc-400 font-[Nunito-regular] text-center">{sublabel}</Text>
          )}
        </View>
      )}
    </View>
    <View
      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full items-center justify-center border-2 border-white"
      style={{ backgroundColor: color.moregreen }}
    >
      <Ionicons name="camera" size={12} color="white" />
    </View>
    {badge && (
      <View className="absolute -top-1 -left-1 bg-orange-500 rounded-full px-1.5 py-0.5">
        <Text className="text-[9px] text-white font-[Nunito-bold]">{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
)

const TimeRow = ({
  startLabel,
  endLabel,
  start,
  end,
  setStart,
  setEnd,
}: {
  startLabel: string
  endLabel: string
  start: string
  end: string
  setStart: (t: string) => void
  setEnd: (t: string) => void
}) => (
  <View className="flex-row gap-3">
    <View className="flex-1">
      <Text className="text-[12px] font-[Nunito-semibold] text-zinc-500 mb-1.5 ml-1">{startLabel}</Text>
      <View className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4">
        <Ionicons name="time-outline" size={16} color="#f97316" />
        <TextInput
          className="flex-1 ml-2 text-zinc-800 text-[14px] font-[Nunito-regular]"
          placeholder="08:00 AM"
          placeholderTextColor="#9ca3af"
          value={start}
          onChangeText={setStart}
        />
      </View>
    </View>
    <View className="flex-1">
      <Text className="text-[12px] font-[Nunito-semibold] text-zinc-500 mb-1.5 ml-1">{endLabel}</Text>
      <View className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4">
        <Ionicons name="time-outline" size={16} color="#f97316" />
        <TextInput
          className="flex-1 ml-2 text-zinc-800 text-[14px] font-[Nunito-regular]"
          placeholder="06:00 PM"
          placeholderTextColor="#9ca3af"
          value={end}
          onChangeText={setEnd}
        />
      </View>
    </View>
  </View>
)

const SecurityBadge = ({ text }: { text: string }) => (
  <View className="flex-row items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3">
    <Ionicons name="shield-checkmark-outline" size={14} color="#16a34a" />
    <Text className="text-[11px] text-green-700 font-[Nunito-semibold] flex-1">{text}</Text>
  </View>
)

const InfoNote = ({ text }: { text: string }) => (
  <View className="flex-row items-start gap-1.5 mt-1.5 mb-3">
    <MaterialIcons name="info-outline" size={13} color="#f97316" style={{ marginTop: 1 }} />
    <Text className="text-[11px] text-zinc-400 font-[Nunito-regular] flex-1">{text}</Text>
  </View>
)

// ─── Main Component ──────────────────────────────────────────────────────────

const Questionnaire = () => {
  const router = useRouter()

  // ── Personal Info ──────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')
  const [nin, setNin] = useState('')            // NIN (Nigerian ID number)
  const [bvn, setBvn] = useState('')            // BVN for bank verification

  // ── Photos ─────────────────────────────────────────────────────────────
  const [selfieUri, setSelfieUri] = useState<string | null>(null)
  const [govIdFrontUri, setGovIdFrontUri] = useState<string | null>(null)
  const [govIdBackUri, setGovIdBackUri] = useState<string | null>(null)
  const [vehicleUri, setVehicleUri] = useState<string | null>(null)
  const [vehiclePlateUri, setVehiclePlateUri] = useState<string | null>(null)

  // ── Bank Details ────────────────────────────────────────────────────────
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  // ── Transport ──────────────────────────────────────────────────────────
  const [transportType, setTransportType] = useState<TransportType | null>(null)
  const [ownsVehicle, setOwnsVehicle] = useState<boolean | null>(null)
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')

  // ── Availability ───────────────────────────────────────────────────────
  const [availDays, setAvailDays] = useState<AvailabilityDay[]>([])
  const [workStart, setWorkStart] = useState('')
  const [workEnd, setWorkEnd] = useState('')
  const [isStudent, setIsStudent] = useState<boolean | null>(null)
  const [schoolName, setSchoolName] = useState('')
  const [classScheduleNote, setClassScheduleNote] = useState('')

  // ── Emergency Contact ──────────────────────────────────────────────────
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [emergencyRelation, setEmergencyRelation] = useState('')

  // ── Guarantor ──────────────────────────────────────────────────────────
  const [guarantorName, setGuarantorName] = useState('')
  const [guarantorPhone, setGuarantorPhone] = useState('')
  const [guarantorAddress, setGuarantorAddress] = useState('')

  // ── Agreement ─────────────────────────────────────────────────────────
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ALL_DAYS: AvailabilityDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const TRANSPORT_OPTIONS: { type: TransportType; icon: string; label: string }[] = [
    { type: 'bicycle', icon: 'bicycle-outline', label: 'Bicycle' },
    { type: 'motorcycle', icon: 'speedometer-outline', label: 'Motorcycle' },
    { type: 'car', icon: 'car-outline', label: 'Car' },
    { type: 'on_foot', icon: 'walk-outline', label: 'On Foot' },
  ]

  const NIGERIAN_BANKS = [
    'Access Bank', 'First Bank', 'GTBank', 'Zenith Bank', 'UBA',
    'Kuda Bank', 'Opay', 'Palmpay', 'Sterling Bank', 'Wema Bank', 'Others',
  ]
  const [bankModalOpen, setBankModalOpen] = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────

  const toggleDay = (day: AvailabilityDay) =>
    setAvailDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )

  const handleSelfie = async () => {
    const uri = await pickImage([1, 1])
    if (uri) setSelfieUri(uri)
  }
  const handleGovIdFront = async () => {
    const uri = await pickImage([4, 3])
    if (uri) setGovIdFrontUri(uri)
  }
  const handleGovIdBack = async () => {
    const uri = await pickImage([4, 3])
    if (uri) setGovIdBackUri(uri)
  }
  const handleVehiclePhoto = async () => {
    const uri = await pickImage([16, 9])
    if (uri) setVehicleUri(uri)
  }
  const handleVehiclePlate = async () => {
    const uri = await pickImage([16, 9])
    if (uri) setVehiclePlateUri(uri)
  }

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim())
      return Alert.alert('Missing info', 'Please enter your full name.')
    if (!phone.trim())
      return Alert.alert('Missing info', 'Phone number is required.')
    if (!nin.trim() || nin.length < 11)
      return Alert.alert('Missing info', 'Enter a valid 11-digit NIN.')
    if (!selfieUri)
      return Alert.alert('Missing photo', 'Please upload a clear selfie.')
    if (!govIdFrontUri)
      return Alert.alert('Missing photo', 'Please upload the front of your government ID.')
    if (!accountNumber.trim() || accountNumber.length < 10)
      return Alert.alert('Missing info', 'Enter a valid 10-digit bank account number.')
    if (!bankName)
      return Alert.alert('Missing info', 'Please select your bank.')
    if (!transportType)
      return Alert.alert('Missing info', 'Select your mode of transport.')
    if (availDays.length === 0)
      return Alert.alert('Missing info', 'Select at least one available day.')
    if (!workStart || !workEnd)
      return Alert.alert('Missing info', 'Set your working hours.')
    if (!emergencyName.trim() || !emergencyPhone.trim())
      return Alert.alert('Missing info', 'Please provide an emergency contact.')
    if (!agreed)
      return Alert.alert('Agreement required', 'You must agree to the terms before submitting.')

    setIsSubmitting(true)
    try {
      // TODO: wire to your backend / Appwrite
      await new Promise((res) => setTimeout(res, 1800))
      Alert.alert(
        'Application submitted! 🎉',
        'We\'ll review your details and get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-[15] border-b border-zinc-100">
        <Text className="text-[16px] font-[Crispy] tracking-tight" style={{ color: color.morange }}>
          Rider Questionnaire
        </Text>
        <Text className="text-[13px] font-[Nunito-medium] mt-[10] text-zinc-400">
          Join our fleet — deliveries on your schedule
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Security intro ── */}
        <SecurityBadge text="Your data is encrypted and used only for verification purposes." />
        <SecurityBadge text="We verify every rider to keep our platform and customers safe." />

        {/* ══════════════════════════════════════════════════ PERSONAL INFO */}
        <SectionDivider title="Personal Info" />

        {/* Selfie */}
        <View className="items-center mb-6">
          <UploadBox
            uri={selfieUri}
            onPress={handleSelfie}
            icon="person-outline"
            label="Your selfie"
            sublabel="Face must be clearly visible"
            badge="REQUIRED"
          />
          <Text className="text-[12px] text-zinc-400 mt-3 font-[Nunito-regular]">
            Tap to upload a clear front-facing photo
          </Text>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <SectionLabel label="First Name" />
            <FieldInput
              icon="person-outline"
              placeholder="e.g. Emeka"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          <View className="flex-1">
            <SectionLabel label="Last Name" />
            <FieldInput
              icon="person-outline"
              placeholder="e.g. Okafor"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View className="mb-4">
          <SectionLabel label="Phone Number" />
          <FieldInput
            icon="call-outline"
            placeholder="e.g. 08012345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            maxLength={11}
          />
        </View>

        <View className="mb-4">
          <SectionLabel label="Email Address" sub="For notifications and account recovery" />
          <FieldInput
            icon="mail-outline"
            placeholder="e.g. emeka@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <SectionLabel label="Date of Birth" sub="Must be 18 years or older" />
          <FieldInput
            icon="calendar-outline"
            placeholder="DD / MM / YYYY"
            value={dob}
            onChangeText={setDob}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <SectionLabel label="Residential Address" />
          <FieldInput
            icon="home-outline"
            placeholder="Street, City, State"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* ══════════════════════════════════════════════════ IDENTITY */}
        <SectionDivider title="Identity Verification" />

        <SecurityBadge text="NIN & Government ID are required by Nigerian law for rider onboarding." />

        <View className="mb-4">
          <SectionLabel label="NIN (National Identification Number)" />
          <FieldInput
            icon="finger-print-outline"
            placeholder="Enter your 11-digit NIN"
            value={nin}
            onChangeText={setNin}
            keyboardType="number-pad"
            maxLength={11}
            autoCapitalize="none"
          />
          <InfoNote text="Your NIN will be verified with NIMC. We do not store raw NIN data." />
        </View>

        {/* Government ID photos */}
        <View className="mb-5">
          <SectionLabel
            label="Government-Issued ID"
            sub="Accepted: NIN slip, Voter's card, Driver's licence, Int'l passport"
          />
          <View className="flex-row gap-4">
            <View className="items-center gap-2">
              <UploadBox
                uri={govIdFrontUri}
                onPress={handleGovIdFront}
                icon="id-card-outline"
                label="Front side"
                badge="REQUIRED"
                aspect={[4, 3]}
              />
              <Text className="text-[11px] text-zinc-400 font-[Nunito-regular]">Front</Text>
            </View>
            <View className="items-center gap-2">
              <UploadBox
                uri={govIdBackUri}
                onPress={handleGovIdBack}
                icon="id-card-outline"
                label="Back side"
                sublabel="If applicable"
                aspect={[4, 3]}
              />
              <Text className="text-[11px] text-zinc-400 font-[Nunito-regular]">Back</Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════ BANK DETAILS */}
        <SectionDivider title="Bank Details" />

        <SecurityBadge text="Bank details are used only for payout processing. Data is encrypted end-to-end." />

        <View className="mb-4">
          <SectionLabel label="BVN (Bank Verification Number)" />
          <FieldInput
            icon="business-outline"
            placeholder="Enter your 11-digit BVN"
            value={bvn}
            onChangeText={setBvn}
            keyboardType="number-pad"
            maxLength={11}
            autoCapitalize="none"
          />
          <InfoNote text="BVN is used to verify your account ownership. We do not perform any transactions." />
        </View>

        <View className="mb-4">
          <SectionLabel label="Bank" />
          <TouchableOpacity
            onPress={() => setBankModalOpen(true)}
            activeOpacity={0.75}
            className="bg-zinc-100 border border-zinc-200 rounded-2xl h-[52px] flex-row items-center px-4 justify-between"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="business-outline" size={16} color={bankName ? '#f97316' : '#9ca3af'} />
              <Text className={`text-[14px] font-[Nunito-regular] ${bankName ? 'text-zinc-800' : 'text-zinc-400'}`}>
                {bankName || 'Select your bank'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <SectionLabel label="Account Number" />
          <FieldInput
            icon="card-outline"
            placeholder="10-digit NUBAN account number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
            maxLength={10}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <SectionLabel label="Account Name" sub="As it appears on your bank records" />
          <FieldInput
            icon="person-circle-outline"
            placeholder="e.g. Emeka Okafor"
            value={accountName}
            onChangeText={setAccountName}
            autoCapitalize="words"
          />
        </View>

        {/* Bank picker modal */}
        <Modal
          visible={bankModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setBankModalOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setBankModalOpen(false)}
            className="flex-1 bg-black/40 justify-end"
          >
            <View className="bg-white rounded-t-3xl px-5 pt-5 pb-14">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[17px] font-[Nunito-bold] text-zinc-800">Select Bank</Text>
                <TouchableOpacity onPress={() => setBankModalOpen(false)}>
                  <Ionicons name="close" size={22} color="#71717a" />
                </TouchableOpacity>
              </View>
              {NIGERIAN_BANKS.map((b) => {
                const isActive = bankName === b
                return (
                  <TouchableOpacity
                    key={b}
                    onPress={() => {
                      setBankName(b)
                      setBankModalOpen(false)
                    }}
                    className={`flex-row items-center gap-3 p-4 rounded-2xl mb-2 border ${
                      isActive ? 'bg-orange-50 border-orange-300' : 'bg-zinc-50 border-zinc-100'
                    }`}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        isActive ? 'bg-orange-500' : 'bg-zinc-200'
                      }`}
                    >
                      <Ionicons name="business" size={14} color={isActive ? 'white' : '#71717a'} />
                    </View>
                    <Text
                      className={`flex-1 text-[14px] font-[Nunito-semibold] ${
                        isActive ? 'text-orange-600' : 'text-zinc-700'
                      }`}
                    >
                      {b}
                    </Text>
                    {isActive && <Ionicons name="checkmark-circle" size={18} color="#f97316" />}
                  </TouchableOpacity>
                )
              })}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ══════════════════════════════════════════════════ TRANSPORT */}
        <SectionDivider title="Transport" />

        <View className="mb-5">
          <SectionLabel label="Mode of Transport" sub="How will you make deliveries?" />
          <View className="flex-row flex-wrap gap-3">
            {TRANSPORT_OPTIONS.map(({ type, icon, label }) => {
              const active = transportType === type
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setTransportType(type)}
                  activeOpacity={0.8}
                  className={`flex-1 min-w-[90px] rounded-2xl border py-3 items-center gap-1 ${
                    active
                      ? 'bg-orange-50 border-orange-400'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <Ionicons name={icon as any} size={22} color={active ? '#f97316' : '#71717a'} />
                  <Text
                    className={`text-[12px] font-[Nunito-semibold] ${
                      active ? 'text-orange-600' : 'text-zinc-500'
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Do you own a vehicle? */}
        {(transportType === 'motorcycle' || transportType === 'car' || transportType === 'bicycle') && (
          <View className="mb-5">
            <SectionLabel label="Do you own this vehicle?" />
            <View className="flex-row gap-3">
              {[{ label: 'Yes, I own it', val: true }, { label: 'No, I borrow/rent', val: false }].map(
                ({ label, val }) => {
                  const active = ownsVehicle === val
                  return (
                    <TouchableOpacity
                      key={String(val)}
                      onPress={() => setOwnsVehicle(val)}
                      activeOpacity={0.8}
                      className={`flex-1 rounded-2xl border py-3 items-center ${
                        active ? 'bg-orange-50 border-orange-400' : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-[Nunito-semibold] ${
                          active ? 'text-orange-600' : 'text-zinc-500'
                        }`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  )
                }
              )}
            </View>
          </View>
        )}

        {/* Vehicle details if owned */}
        {ownsVehicle && (
          <>
            <View className="mb-4">
              <SectionLabel label="Vehicle Make / Model" />
              <FieldInput
                icon="car-outline"
                placeholder="e.g. Honda CB125F, Toyota Corolla"
                value={vehicleMake}
                onChangeText={setVehicleMake}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <SectionLabel label="Number Plate" />
              <FieldInput
                icon="document-text-outline"
                placeholder="e.g. ABC-123-XY"
                value={vehiclePlate}
                onChangeText={setVehiclePlate}
                autoCapitalize="characters"
              />
            </View>

            {/* Vehicle photos */}
            <View className="mb-5">
              <SectionLabel label="Vehicle Photos" sub="Clear photos help us verify ownership" />
              <View className="gap-4">
                <View>
                  <Text className="text-[12px] font-[Nunito-semibold] text-zinc-500 mb-1.5 ml-1">
                    Full vehicle photo
                  </Text>
                  <UploadBox
                    uri={vehicleUri}
                    onPress={handleVehiclePhoto}
                    icon="car-sport-outline"
                    label="Full vehicle photo"
                    sublabel="Show the whole vehicle"
                    wide
                    aspect={[16, 9]}
                  />
                </View>
                <View>
                  <Text className="text-[12px] font-[Nunito-semibold] text-zinc-500 mb-1.5 ml-1">
                    Number plate close-up
                  </Text>
                  <UploadBox
                    uri={vehiclePlateUri}
                    onPress={handleVehiclePlate}
                    icon="document-text-outline"
                    label="Number plate photo"
                    sublabel="Must be legible"
                    wide
                    aspect={[16, 9]}
                  />
                </View>
              </View>
            </View>
          </>
        )}

        {/* ══════════════════════════════════════════════════ AVAILABILITY */}
        <SectionDivider title="Availability" />

        {/* Days */}
        <View className="mb-5">
          <SectionLabel label="Available Days" sub="Select all days you can work" />
          <View className="flex-row flex-wrap gap-2">
            {ALL_DAYS.map((day) => {
              const active = availDays.includes(day)
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.8}
                  className={`rounded-xl px-4 py-2 border ${
                    active ? 'bg-orange-500 border-orange-500' : 'bg-zinc-100 border-zinc-200'
                  }`}
                >
                  <Text
                    className={`text-[13px] font-[Nunito-semibold] ${
                      active ? 'text-white' : 'text-zinc-600'
                    }`}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Hours */}
        <View className="mb-5">
          <SectionLabel label="Working Hours" sub="Your typical available window each day" />
          <TimeRow
            startLabel="Available from"
            endLabel="Until"
            start={workStart}
            end={workEnd}
            setStart={setWorkStart}
            setEnd={setWorkEnd}
          />
          <InfoNote text="You can always adjust your availability from the app after onboarding." />
        </View>

        {/* Student */}
        <View className="mb-5">
          <SectionLabel label="Are you currently a student?" />
          <View className="flex-row gap-3 mb-3">
            {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => {
              const active = isStudent === val
              return (
                <TouchableOpacity
                  key={String(val)}
                  onPress={() => setIsStudent(val)}
                  activeOpacity={0.8}
                  className={`flex-1 rounded-2xl border py-3 items-center ${
                    active ? 'bg-orange-50 border-orange-400' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <Text
                    className={`text-[13px] font-[Nunito-semibold] ${
                      active ? 'text-orange-600' : 'text-zinc-500'
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {isStudent && (
            <>
              <View className="mb-3">
                <SectionLabel label="School / Institution" />
                <FieldInput
                  icon="school-outline"
                  placeholder="e.g. University of Lagos"
                  value={schoolName}
                  onChangeText={setSchoolName}
                  autoCapitalize="words"
                />
              </View>
              <View className="mb-3">
                <SectionLabel
                  label="Class Schedule Notes"
                  sub="Help us assign deliveries around your classes"
                />
                <View className="bg-zinc-100 border border-zinc-200 rounded-2xl p-4 min-h-[80px]">
                  <TextInput
                    className="text-zinc-800 text-[14px] font-[Nunito-regular]"
                    placeholder="e.g. Lectures Mon–Wed 8AM–2PM, free every evening"
                    placeholderTextColor="#9ca3af"
                    value={classScheduleNote}
                    onChangeText={setClassScheduleNote}
                    multiline
                    maxLength={200}
                  />
                </View>
                <Text className="text-[11px] text-zinc-400 mt-1 text-right font-[Nunito-regular]">
                  {classScheduleNote.length}/200
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ══════════════════════════════════════════════════ EMERGENCY CONTACT */}
        <SectionDivider title="Emergency Contact" />

        <SecurityBadge text="This person will only be contacted in case of an emergency on a delivery." />

        <View className="mb-4">
          <SectionLabel label="Full Name" />
          <FieldInput
            icon="person-outline"
            placeholder="e.g. Ngozi Okafor"
            value={emergencyName}
            onChangeText={setEmergencyName}
            autoCapitalize="words"
          />
        </View>

        <View className="mb-4">
          <SectionLabel label="Phone Number" />
          <FieldInput
            icon="call-outline"
            placeholder="e.g. 08098765432"
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            keyboardType="phone-pad"
            maxLength={11}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <SectionLabel label="Relationship" />
          <FieldInput
            icon="heart-outline"
            placeholder="e.g. Mother, Brother, Friend"
            value={emergencyRelation}
            onChangeText={setEmergencyRelation}
            autoCapitalize="words"
          />
        </View>

        {/* ══════════════════════════════════════════════════ GUARANTOR */}
        <SectionDivider title="Guarantor" />

        <View className="flex-row items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-3 mb-4">
          <Ionicons name="warning-outline" size={16} color="#d97706" style={{ marginTop: 1 }} />
          <Text className="text-[12px] text-amber-700 font-[Nunito-semibold] flex-1">
            A guarantor vouches for your character and reliability. This is required for all new riders.
          </Text>
        </View>

        <View className="mb-4">
          <SectionLabel label="Guarantor Full Name" />
          <FieldInput
            icon="person-circle-outline"
            placeholder="e.g. Chukwuemeka Adeyemi"
            value={guarantorName}
            onChangeText={setGuarantorName}
            autoCapitalize="words"
          />
        </View>

        <View className="mb-4">
          <SectionLabel label="Guarantor Phone" />
          <FieldInput
            icon="call-outline"
            placeholder="e.g. 07012345678"
            value={guarantorPhone}
            onChangeText={setGuarantorPhone}
            keyboardType="phone-pad"
            maxLength={11}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <SectionLabel label="Guarantor Address" />
          <FieldInput
            icon="home-outline"
            placeholder="Street, City, State"
            value={guarantorAddress}
            onChangeText={setGuarantorAddress}
          />
        </View>

        {/* ══════════════════════════════════════════════════ AGREEMENT */}
        <SectionDivider title="Agreement" />

        <TouchableOpacity
          onPress={() => setAgreed((v) => !v)}
          activeOpacity={0.8}
          className={`flex-row items-start gap-3 p-4 rounded-2xl border mb-6 ${
            agreed ? 'bg-orange-50 border-orange-300' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          <View
            className={`w-6 h-6 rounded-md border-2 items-center justify-center mt-0.5 ${
              agreed ? 'bg-orange-500 border-orange-500' : 'border-zinc-300 bg-white'
            }`}
          >
            {agreed && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text className="flex-1 text-[13px] text-zinc-600 font-[Nunito-regular] leading-5">
            I confirm that all information provided is accurate and up-to-date. I agree to the{' '}
            <Text className="text-orange-500 font-[Nunito-semibold]">Rider Terms & Conditions</Text>,{' '}
            <Text className="text-orange-500 font-[Nunito-semibold]">Privacy Policy</Text>, and consent
            to identity verification and background checks.
          </Text>
        </TouchableOpacity>

        {/* ── Submit ── */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
          className="mt-2"
        >
          <View className="bg-orange-500 rounded-2xl h-[58px] flex-row items-center justify-center gap-2 shadow-sm">
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text className="text-white font-[Nunito-bold] text-[16px] tracking-wide">
                  Submit Application
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <Text className="text-center text-[11px] text-zinc-400 mt-3 font-[Nunito-regular]">
          Applications are reviewed within 24 hours
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Questionnaire
