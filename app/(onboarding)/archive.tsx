import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";

export default function OnboardingArchiveScreen() {
  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        className="flex-1 px-8 pb-24 pt-16"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="mb-10 items-center">
          <View className="mb-8 h-40 w-40 items-center justify-center rounded-full border border-secondary/40 bg-surface-container-low">
            <Ionicons name="albums" size={48} color="#e9c176" />
          </View>
          <Text className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
            Archive Forever
          </Text>
          <Text className="mt-2 text-center font-headline text-5xl font-extrabold tracking-tight text-primary-container">
            A Digital Time Capsule
          </Text>
          <Text className="mt-4 max-w-lg text-center font-body text-lg font-light leading-relaxed text-on-surface-variant">
            Your graduation isn&apos;t just a day, it&apos;s a milestone. Archive it
            forever in your personal vault.
          </Text>
        </View>
        <PrimaryButton
          label="Get Started"
          onPress={() => router.push("/user-setup")}
        />
        <View className="mt-8 flex-row justify-center gap-2">
          <View className="h-1.5 w-1.5 rounded-full bg-outline-variant/30" />
          <View className="h-1.5 w-1.5 rounded-full bg-outline-variant/30" />
          <View className="h-1.5 w-1.5 rounded-full bg-outline-variant/30" />
          <View className="h-6 w-1.5 rounded-full bg-primary-container" />
        </View>
      </ScrollView>
    </View>
  );
}
