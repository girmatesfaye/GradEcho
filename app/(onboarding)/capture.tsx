import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";

const BG = require("../../assets/stitch/onboarding-capture.png");

export default function OnboardingCaptureScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <View className="absolute inset-0">
        <Image
          source={BG}
          className="h-full w-full opacity-90"
          contentFit="cover"
        />
        <View className="absolute inset-0 bg-surface/70" />
      </View>
      <View className="z-10 flex-row items-center justify-end bg-surface/60 px-6 py-4 border-b border-outline-variant/20">
        {/* <Pressable onPress={() => router.push("/welcome")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#ffd700" />
        </Pressable>
        <Text className="font-headline text-base font-black italic tracking-tighter text-primary-container">
          The Keepsake
        </Text> */}
        <Pressable onPress={() => router.push("/user-setup")}>
          <Text className="font-headline font-bold text-primary-container">
            Skip
          </Text>
        </Pressable>
      </View>
      <ScrollView
        className="z-10 flex-1 px-8 pt-8"
        contentContainerClassName="pb-40"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text className="mt-2 font-headline text-5xl font-extrabold leading-[0.95] tracking-tighter text-primary">
          Capture Every{" "}
          <Text className="italic text-primary-container">Emotion</Text>
        </Text>
        <Text className="mt-4 max-w-xl font-body text-lg leading-relaxed text-on-surface-variant">
          Save the cheers, the tears, and the laughs with high-fidelity photo
          and voice memories. Every second of your legacy, preserved in gold.
        </Text>
        <View className="mt-6 flex-row gap-4">
          <View className="flex-1 flex-row items-center gap-3 rounded-lg bg-surface-container-high/60 p-4">
            <View className="rounded-full bg-primary-container/20 p-2">
              <Ionicons name="mic" size={22} color="#ffd700" />
            </View>
            <View>
              <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Voice
              </Text>
              <Text className="font-headline text-sm font-bold text-primary">
                Spatial Audio
              </Text>
            </View>
          </View>
          <View className="flex-1 flex-row items-center gap-3 rounded-lg bg-surface-container-high/60 p-4">
            <View className="rounded-full bg-primary-container/20 p-2">
              <Ionicons name="camera" size={22} color="#ffd700" />
            </View>
            <View>
              <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Visual
              </Text>
              <Text className="font-headline text-sm font-bold text-primary">
                Raw Clarity
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="z-10 border-t border-outline-variant/20 bg-surface/80 px-6 pb-6 pt-4">
        <View className="mb-4 flex-row items-center justify-center gap-2">
          <View className="h-1 w-12 rounded-full bg-primary-container" />
          <View className="h-1 w-8 rounded-full bg-surface-container-highest" />
          <View className="h-1 w-8 rounded-full bg-surface-container-highest" />
        </View>
        <PrimaryButton
          label="Next"
          onPress={() => router.push("/connect")}
          rightIcon="arrow-forward"
        />
      </View>
    </SafeAreaView>
  );
}
