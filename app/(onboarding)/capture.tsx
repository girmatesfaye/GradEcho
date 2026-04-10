import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingBackground } from "@/components/onboarding-background";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";

const BG = require("../../assets/images/Capture-screen.png");

export default function OnboardingCaptureScreen() {
  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <OnboardingBackground source={BG} overlayOpacity={0.25} />
      <View className="z-10 flex-row items-center justify-end bg-surface/60 px-6 py-4 border-b border-outline-variant/20">
        {/* <Pressable onPress={() => router.push("/welcome")} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#ffd700" />
        </Pressable>
        <Text className="font-headline text-base font-black italic tracking-tighter text-primary-container">
          The Keepsake
        </Text> */}
        <SecondaryButton
          label="Skip"
          onPress={() => router.push("/user-setup")}
          fullWidth={false}
          className="h-10 border-primary-container/40 px-5"
          textClassName="text-sm font-semibold text-primary-container"
        />
      </View>
      <ScrollView
        className="z-10 flex-1 px-8 pt-8"
        contentContainerClassName="pb-40"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text
          className="mt-2 font-headline text-5xl font-extrabold leading-[0.95] tracking-tighter text-primary"
          style={{
            textShadowColor: "rgba(0, 0, 0, 0.75)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 10,
          }}
        >
          Capture Every{" "}
          <Text className="italic text-primary-container">Emotion</Text>
        </Text>
        <Text
          className="mt-4 max-w-xl font-body text-lg leading-relaxed text-primary"
          style={{ opacity: 0.9 }}
        >
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
