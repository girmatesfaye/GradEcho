import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { supabase } from "@/lib/supabase";

const BG = require("../assets/stitch/user-setup.png");

export default function UserSetupScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("2024");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !university || !email || !password) {
      Alert.alert("Missing fields", "Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak password", "Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          university,
          department,
          graduation_year: year,
        },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign up failed", error.message);
      return;
    }

    if (data.session) {
      router.replace("/home");
      return;
    }

    Alert.alert(
      "Check your email",
      "We sent a confirmation link. Verify your email, then sign in.",
    );
    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <View className="absolute inset-0">
        <Image source={BG} className="h-full w-full" contentFit="cover" />
        <View className="absolute inset-0 bg-surface/78" />
      </View>
      {/* <View className="z-10 flex-row items-center justify-between bg-surface/60 px-6 py-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#ffd700" />
        </Pressable>
        <Text className="font-headline text-base font-black italic tracking-tighter text-primary-container">
          The Keepsake
        </Text>
        <Pressable onPress={() => router.push("/login")}>
          <Text className="font-headline font-bold text-primary-container">
            Skip
          </Text>
        </Pressable>
      </View> */}
      <KeyboardAvoidingView
        className="flex-1 bg-surface"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          className="flex-1 px-6 pt-8"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="mb-10">
            <Text className="font-headline text-4xl font-extrabold leading-tight tracking-tight text-primary">
              Create Your{"\n"}
              <Text className="text-primary-container">Digital Keepsake</Text>
            </Text>
            <Text className="mt-4 max-w-md font-body text-lg text-on-surface-variant">
              Complete your profile to begin archiving your graduation journey
              and connecting with your batch.
            </Text>
          </View>
          <View className="gap-6">
            <View>
              <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Full Name
              </Text>
              <View className="relative">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Johnathan Echo"
                  placeholderTextColor="#d0c6ab66"
                  className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
                />
                <View className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Ionicons name="person-outline" size={22} color="#d0c6ab55" />
                </View>
              </View>
            </View>
            <View>
              <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                University
              </Text>
              <View className="relative">
                <TextInput
                  value={university}
                  onChangeText={setUniversity}
                  placeholder="Enter University Name"
                  placeholderTextColor="#d0c6ab66"
                  className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
                />
                <View className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Ionicons name="school-outline" size={22} color="#d0c6ab55" />
                </View>
              </View>
            </View>
            <View>
              <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Department
              </Text>
              <View className="relative">
                <TextInput
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="Enter Department Name"
                  placeholderTextColor="#d0c6ab66"
                  className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
                />
                <View className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Ionicons
                    name="business-outline"
                    size={22}
                    color="#d0c6ab55"
                  />
                </View>
              </View>
            </View>
            <View>
              <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Graduation Year
              </Text>
              <TextInput
                value={year}
                onChangeText={setYear}
                keyboardType="number-pad"
                placeholder="2024"
                placeholderTextColor="#d0c6ab66"
                className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
              />
            </View>
            <View>
              <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Email
              </Text>
              <View className="relative">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@university.edu"
                  placeholderTextColor="#d0c6ab66"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
                />
                <View className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Ionicons name="mail-outline" size={22} color="#d0c6ab55" />
                </View>
              </View>
            </View>
            <View>
              <Text className="mb-2 px-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  placeholderTextColor="#d0c6ab66"
                  autoCapitalize="none"
                  secureTextEntry={!passwordVisible}
                  className="rounded-lg bg-surface-container-low px-6 py-5 pr-16 font-body text-base text-on-surface"
                />
                <Pressable
                  onPress={() => setPasswordVisible((prev) => !prev)}
                  hitSlop={10}
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                >
                  <Ionicons
                    name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#d0c6ab55"
                  />
                </Pressable>
              </View>
            </View>
          </View>
          <View className="mt-10 rounded-2xl border border-outline-variant/15 bg-surface/75 px-4 py-4">
            <PrimaryButton
              label="Continue to Login"
              onPress={handleSignUp}
              rightIcon="arrow-forward"
              disabled={loading}
            />
            <SecondaryButton
              label="Sign In"
              onPress={() => router.push("/login")}
              className="mt-3"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
