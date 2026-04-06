import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";

const BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDkocZ3o_yTYzT2BLJIRjActGvQxZl_RHurn3apPsWECsQZ4exlWlKdjdHOa18Wx7HpDQjYmLbeAvovCBSGKRbNc8k6Cy_lQMs35w9XzoqN7NoenAbslKwC88b-qMHnsyVIrvIR27c9wIzcYSQWMtgdVRn8ijnoDoic2NXdBQ-Nr0sS0tTzh1QFwTMFR_vZJ2DECmzIgtUaDzC3nC_R3czwHQj5Q9X4uXdXPfjRbj4PEUL_YQnOdpb2qqPuO6zv3cbY0t_oNnDoUizg";

export default function OnboardingCaptureScreen() {
  return (
    <View className="flex-1 bg-surface">
      <View className="absolute inset-0">
        <Image source={{ uri: BG }} className="h-full w-full opacity-90" contentFit="cover" />
        <View className="absolute inset-0 bg-surface/70" />
      </View>
      <ScrollView
        className="flex-1 px-8 pb-24 pt-14"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary-fixed-dim">
          Step 02 - Memory Hub
        </Text>
        <Text className="mt-2 font-headline text-5xl font-extrabold leading-[0.95] tracking-tighter text-primary">
          Capture Every{" "}
          <Text className="italic text-primary-container">Emotion</Text>
        </Text>
        <Text className="mt-4 max-w-xl font-body text-lg leading-relaxed text-on-surface-variant">
          Save the cheers, the tears, and the laughs with high-fidelity photo and
          voice memories. Every second of your legacy, preserved in gold.
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
        <View className="mt-10 flex-row items-center justify-between">
          <View className="flex-row gap-2">
            <View className="h-1 w-8 rounded-full bg-surface-container-highest" />
            <View className="h-1 w-12 rounded-full bg-primary-container" />
            <View className="h-1 w-8 rounded-full bg-surface-container-highest" />
          </View>
          <PrimaryButton
            label="Next"
            onPress={() => router.push("/connect")}
            rightIcon="arrow-forward"
            fullWidth={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}
