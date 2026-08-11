import CustomButton from "@/components/ui/CustomButton";
import CustomInput from "@/components/ui/CustomInput";
import { color } from "@/constants";
import {
    SignIn as EmailSignIn,
    OAuthSignIn,
    refreshAuthStore,
} from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

// bg will be decorated beautifully with probalbly orange color
export default function SignIn() {
  const { isAuthenticated, fetchAuthenticatedUser } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    refreshAuthStore();
    if (!form.email || !form.password)
      Alert.alert("Error", "Please enter valid email address and password");
    setIsSubmitting(true);
    try {
      await EmailSignIn({ email: form.email, password: form.password });
      Alert.alert("Success", "You have signed in successfully");

      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Error",
        "There was an error encountered while signing in. Please check your credentials and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async () => {
    setIsSubmittingGoogle(true);
    try {
      const result = await OAuthSignIn();
      if (result) {
        fetchAuthenticatedUser();
      } else throw new Error();
    } catch (error: any) {
      Alert.alert(
        "OAuth Error",
        error.message || "Failed to sign in with Google. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className=" bg-white flex  rounded-lg pb-20  p-5 ">
      <View className="absolute top-[-320]  w-screen ">
        {/* obviously cha */}
        <Text
          className=" text-3xl text-center"
          style={{
            fontFamily: "Crispy",
            color: color.morange,
            letterSpacing: 0,
            textShadowColor: "white",
            textShadowOffset: { width: -0.5, height: 0.5 },
            textShadowRadius: 0.6,
          }}
        >
          sign in
        </Text>
      </View>

      {/* <CustomInput
        placeholder='Enter your name'
        value={form.name} 
        onChangeText={(text)=>{
            setForm({...form, name:text})
        }}
        label="Name"
        keyboardType="default"

        /> */}
      <View className="gap-10 flex pt-10">
        {/* maybe welcome to morengo here, or get started with morengo */}
        <View>
          <CustomInput
            placeholder="Enter your email"
            value={form.email}
            onChangeText={(text) => {
              if (form.password.length < 6) {
              }
              setForm({ ...form, email: text });
            }}
            label="Email"
            keyboardType="email-address"
          />
          {/* { <Text className='text-red-300 mt-2 mb-0 pb-0'>Please provide a valid email</Text>} */}
        </View>

        <CustomInput
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(text) => {
            setForm({ ...form, password: text });
          }}
          label="Password"
          secureTextEntry={true}
        />

        <TouchableOpacity
          onPress={() => router.push("/(screens)/ResetPassword")}
        >
          <Text className={`text-right text-green-300 tracking-wide`}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <CustomButton
          title="Sign In"
          onPress={submit}
          style={`bg-[#fc7323]`}
          isLoading={isSubmitting}
        />

        <Text className="text-center text-md">OR</Text>

        <CustomButton
          title="Connect with Google"
          style={"bg-blue-500"}
          onPress={handleOAuthSignIn}
          isLoading={isSubmittingGoogle}
        />
        <View className="flex-row items-end mb-3">
          <Text className=" tracking-wide">Don't have an account yet? </Text>
          <Link href={"./sign-up"} className="text-green-300">
            Sign Up
          </Link>
        </View>
      </View>
    </View>
  );
}
