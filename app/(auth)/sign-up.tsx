import { CustomDropdown } from "@/components";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeterBar";
import CustomButton from "@/components/ui/CustomButton";
import CustomInput from "@/components/ui/CustomInput";
import CustomRadio from "@/components/ui/CustomRadio";
import { color } from "@/constants";
import { createUser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

export default function SignUp() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    institution: "",
    isStudent: true,
  });
  const [strengthScore, setStrengthScore] = useState(-1);
  const [isChecked, setChecked] = useState(false);
  const isPasswordValid = strengthScore >= 2;
  const [isDisabled, setIsDisabled] = useState(true);
  const [isInrerestedPartner, setIsInterestedPartner] = useState(false);

  useEffect(() => {
    if (!form.name || !form.email || !form.password || !form.number)
      setIsDisabled(true);
    else setIsDisabled(false);
  }, [form]);

  const submit = async () => {
    const { name, email, password, institution, phone, isStudent } = form;
    if (!form.name || !form.email || !form.password)
      throw Error("Please enter valid email address and password");
    if (!form.phone || (form.isStudent && !form.institution))
      throw Error("Please fill all the fields");
    if (!isPasswordValid) throw Error("Please choose a stronger password.");
    if (form.phone.length != 11) throw Error("Number must be 11 digits");
    setIsSubmitting(true);

    try {
      await createUser({
        email,
        password,
        name,
        institution,
        phone,
        isStudent,
      });
      // setUser({  email, name, institution, number,  isStudent})
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-10 bg-white pb-20 rounded-lg p-5 ">
      <View className="absolute top-[-320]  w-screen ">
        {/* obviously cha */}
        <Text
          className="text-white text-3xl text-center"
          style={{
            fontFamily: "Crispy",
            color: color.morange,
            letterSpacing: 0,
            textShadowColor: "white",
            textShadowOffset: { width: -0.5, height: 0.5 },
            textShadowRadius: 0.6,
          }}
        >
          sign up
        </Text>
      </View>

      <View className="flex-row items-center mt-4 mb-0">
        <Text className="text-left tracking-wide">
          Already have an account?{" "}
          <Link href={"./sign-in"} className="text-green-300">
            Sign In
          </Link>
        </Text>
      </View>

      <CustomInput
        placeholder="Enter your name"
        value={form.name}
        onChangeText={(text) => {
          setForm({ ...form, name: text });
        }}
        label="Name"
      />

      <CustomInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => {
          setForm({ ...form, email: text });
        }}
        label="Email"
        keyboardType="email-address"
      />

      <View className="gap-2">
        <CustomInput
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(text) => {
            setForm({ ...form, password: text });
          }}
          label="Password"
          secureTextEntry={true}
        />

        {form.password && (
          <PasswordStrengthMeter
            password={form.password}
            onStrengthChange={(score) => setStrengthScore(score)}
          />
        )}
      </View>

      <CustomInput
        placeholder="Enter your phone number"
        value={form.phone}
        onChangeText={(text) => {
          setForm({ ...form, phone: text });
        }}
        label="Number"
        keyboardType="numeric"
        maxLength={11}
        secureTextEntry={false}
      />

      <CustomRadio
        value={form.isStudent}
        onValueChange={(value) => {
          setForm({ ...form, isStudent: value });
        }}
        optiona="Yes"
        optionb="No"
        type="student"
        title="Are you a student?"
      />

      {form.isStudent && (
        <CustomDropdown
          value={form.institution}
          onValueChange={(value) => setForm({ ...form, institution: value })}
        />
      )}

      <CustomRadio
        value={isInrerestedPartner}
        onValueChange={(value) => {
          setIsInterestedPartner(value);
        }}
        optiona="As a customer"
        optionb="As a seller(entrepreneur)"
        type="role"
        title="How do you primarily intend to use Morengo?"
      />
      <CustomButton
        title="Create Account"
        onPress={submit}
        style={`bg-[#57a886] mt-6`}
        isLoading={isSubmitting}
      />
      <View className="mt-6">
        <Text className=" mb-3  font-light  leading-5 tracking-wide mx-auto">
          Curious about Morengo?{" "}
        </Text>
        <Link
          href={"/"}
          className="text-blue-400 text-center font-light text-sm leading-5 tracking-wide"
        >
          {" "}
          Learn more about how our platform works whether you're looking to sell
          or to shop.
        </Link>
      </View>
    </View>
  );
}
