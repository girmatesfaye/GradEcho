import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

WebBrowser.maybeCompleteAuthSession();

function parseTokensFromUrl(url: string) {
  const hash = url.split("#")[1] ?? "";
  const params = new URLSearchParams(hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (!access_token || !refresh_token) {
    return null;
  }

  return { access_token, refresh_token };
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    router.replace("/home");
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const redirectTo = Linking.createURL("auth/callback");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      setLoading(false);
      Alert.alert("Google sign in failed", error?.message ?? "No auth URL returned.");
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== "success" || !result.url) {
      setLoading(false);
      return;
    }

    const tokens = parseTokensFromUrl(result.url);

    if (!tokens) {
      setLoading(false);
      Alert.alert("Google sign in failed", "Could not extract auth tokens.");
      return;
    }

    const { error: sessionError } = await supabase.auth.setSession(tokens);
    setLoading(false);

    if (sessionError) {
      Alert.alert("Google sign in failed", sessionError.message);
      return;
    }

    router.replace("/home");
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
        <Pressable onPress={() => router.push("/home")}>
          <Text className="font-headline font-bold text-primary-container">
            Skip
          </Text>
        </Pressable>
      </View> */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          className="flex-1 px-6 pt-8"
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="mb-10">
            <Text className="font-headline text-4xl font-extrabold leading-tight tracking-tight text-primary">
              Welcome Back{"\n"}
              <Text className="text-primary-container">Sign In</Text>
            </Text>
            <Text className="mt-4 max-w-md font-body text-lg text-on-surface-variant">
              Access your archive and continue preserving your graduation
              memories.
            </Text>
          </View>
          <View className="gap-6">
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
                  placeholder="Enter your password"
                  placeholderTextColor="#d0c6ab66"
                  autoCapitalize="none"
                  secureTextEntry
                  className="rounded-lg bg-surface-container-low px-6 py-5 font-body text-base text-on-surface"
                />
                <View className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#d0c6ab55"
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View
          className="border-t border-outline-variant/20 bg-surface/90 px-6 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <PrimaryButton
            label="Login"
            onPress={handleLogin}
            rightIcon="arrow-forward"
            disabled={loading}
          />
          <SecondaryButton
            label="Continue with Google"
            onPress={handleGoogleSignIn}
            className="mt-3"
            disabled={loading}
          />
          <SecondaryButton
            label="Create New Account"
            onPress={() => router.push("/user-setup")}
            className="mt-3"
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
