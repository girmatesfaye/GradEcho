import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "@/components/primary-button";

const BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDkocZ3o_yTYzT2BLJIRjActGvQxZl_RHurn3apPsWECsQZ4exlWlKdjdHOa18Wx7HpDQjYmLbeAvovCBSGKRbNc8k6Cy_lQMs35w9XzoqN7NoenAbslKwC88b-qMHnsyVIrvIR27c9wIzcYSQWMtgdVRn8ijnoDoic2NXdBQ-Nr0sS0tTzh1QFwTMFR_vZJ2DECmzIgtUaDzC3nC_R3czwHQj5Q9X4uXdXPfjRbj4PEUL_YQnOdpb2qqPuO6zv3cbY0t_oNnDoUizg";

const PEERS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBQopw5sJBLnIX9IXbDee7WqWE1V8ngLW4eslrqPscCEkqJ5VmKZFJts3DkQCYZ3X9mPA0rIUW6ZYHwbiofCBe5_kBSoxbJFIDB8LD_u8BI_5VjvJwmV53RxnvNKHH3nlSoMX3wTNFHiOiMo0DIocVWqo5Be5d8XnqkrSkU9skYrCTaMF79nmdiYUPGGdS3rrjy-7SVcgqxYVAOxieiTANnVxSv9MSSPRYlexH4AU763WavKI5-KJHhbZ7SADLFfWgJedet-Zd1ig63",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuANprItSSTLbg-q2-XrQY_0KIFKHBE5ifOd7yM8d2wJDSbn4w0fjQcBt-B_3wklDSQB25E5X2j4k0CEGo4dEAXXtkBjqIOuxDVJ41llyoEBuBby8mqLWvyD2PW7sSUx8gkJykwtZ2AVCDtqR3eZcZK9aPJVvo_lmyHOptBjdADiJks_HRVr2TI15Sc64lSWSeKDStaA8-vqb9FjTcGx7qEjTIe08jSXvoBNuyQnyyNgJDtjy-W80WKqusaRYrsaoEmwYsFzVdaxQNxv",
];

export default function OnboardingConnectScreen() {
  return (
    <View className="flex-1 bg-surface">
      <View className="absolute inset-0 z-0">
        <Image source={{ uri: BG }} className="h-full w-full" contentFit="cover" />
        <View className="absolute inset-0 bg-surface/50" />
      </View>
      <View className="z-10 flex-row items-center justify-between bg-surface/60 px-6 py-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#ffd700" />
        </Pressable>
        <Text className="font-headline text-base font-black italic tracking-tighter text-primary-container">
          The Keepsake
        </Text>
        <Pressable onPress={() => router.push("/archive")}>
          <Text className="font-headline font-bold text-primary-container">Skip</Text>
        </Pressable>
      </View>
      <ScrollView
        className="z-10 flex-1 px-6 pb-32 pt-8"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="mb-8 flex-row gap-3">
          <View className="h-0.5 w-8 rounded-full bg-on-surface-variant/30" />
          <View className="h-0.5 w-8 rounded-full bg-on-surface-variant/30" />
          <View className="h-1 w-12 rounded-full bg-primary-container" />
        </View>
        <Text className="font-headline text-5xl font-extrabold leading-[0.9] tracking-tighter text-primary">
          Celebrate{"\n"}
          <Text className="text-primary-container">Together</Text>
        </Text>
        <Text className="mt-4 max-w-md font-body text-lg font-light leading-relaxed text-on-surface-variant">
          Stay connected with your batch and department. Relive your shared journey
          through their eyes.
        </Text>
        <View className="mt-10 flex-row flex-wrap justify-between gap-4">
          {PEERS.map((uri, i) => (
            <View
              key={uri}
              className={`w-[47%] items-center rounded-lg bg-surface-container-high/50 p-4 ${i % 2 === 1 ? "mt-4" : ""}`}
            >
              <View className="mb-2 h-12 w-12 overflow-hidden rounded-full border border-primary-container/20">
                <Image source={{ uri }} className="h-full w-full" contentFit="cover" />
              </View>
              <Text className="font-label text-[10px] uppercase tracking-widest text-secondary">
                {i === 0 ? "Class of 2024" : "Department"}
              </Text>
            </View>
          ))}
        </View>
        <PrimaryButton
          label="Next"
          onPress={() => router.push("/archive")}
          fullWidth={false}
          className="mt-12 self-end"
        />
      </ScrollView>
    </View>
  );
}
