import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { Ionicons } from "@expo/vector-icons";

const BG = require("../../assets/stitch/onboarding-connect.png");

const PEERS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBQopw5sJBLnIX9IXbDee7WqWE1V8ngLW4eslrqPscCEkqJ5VmKZFJts3DkQCYZ3X9mPA0rIUW6ZYHwbiofCBe5_kBSoxbJFIDB8LD_u8BI_5VjvJwmV53RxnvNKHH3nlSoMX3wTNFHiOiMo0DIocVWqo5Be5d8XnqkrSkU9skYrCTaMF79nmdiYUPGGdS3rrjy-7SVcgqxYVAOxieiTANnVxSv9MSSPRYlexH4AU763WavKI5-KJHhbZ7SADLFfWgJedet-Zd1ig63",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuANprItSSTLbg-q2-XrQY_0KIFKHBE5ifOd7yM8d2wJDSbn4w0fjQcBt-B_3wklDSQB25E5X2j4k0CEGo4dEAXXtkBjqIOuxDVJ41llyoEBuBby8mqLWvyD2PW7sSUx8gkJykwtZ2AVCDtqR3eZcZK9aPJVvo_lmyHOptBjdADiJks_HRVr2TI15Sc64lSWSeKDStaA8-vqb9FjTcGx7qEjTIe08jSXvoBNuyQnyyNgJDtjy-W80WKqusaRYrsaoEmwYsFzVdaxQNxv",
];

export default function OnboardingConnectScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <View className="absolute inset-0 z-0">
        <Image source={BG} className="h-full w-full" contentFit="cover" />
        <View className="absolute inset-0 bg-surface/50" />
      </View>
      <View className="z-10 flex-row items-center justify-between bg-surface/60 px-6 py-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#ffd700" />
        </Pressable>
        {/* <Text className="font-headline text-base font-black italic tracking-tighter text-primary-container">
          The Keepsake
        </Text> */}
        <Pressable onPress={() => router.push("/user-setup")}>
          <Text className="font-headline font-bold text-primary-container">
            Skip
          </Text>
        </Pressable>
      </View>
      <ScrollView
        className="z-10 flex-1 px-6 pt-8"
        contentContainerClassName="pb-40"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text className="font-headline text-5xl font-extrabold leading-[0.9] tracking-tighter text-primary">
          Celebrate{"\n"}
          <Text className="text-primary-container">Together</Text>
        </Text>
        <Text className="mt-4 max-w-md font-body text-lg font-light leading-relaxed text-on-surface-variant">
          Stay connected with your batch and department. Relive your shared
          journey through their eyes.
        </Text>
        <View className="mt-10 flex-row flex-wrap justify-between gap-4">
          {PEERS.map((uri, i) => (
            <View
              key={uri}
              className={`w-[47%] items-center rounded-lg bg-surface-container-high/50 p-4 ${i % 2 === 1 ? "mt-4" : ""}`}
            >
              <View className="mb-2 h-12 w-12 overflow-hidden rounded-full border border-primary-container/20">
                <Image
                  source={{ uri }}
                  className="h-full w-full"
                  contentFit="cover"
                />
              </View>
              <Text className="font-label text-[10px] uppercase tracking-widest text-secondary">
                {i === 0 ? "Class of 2024" : "Department"}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="z-10 border-t border-outline-variant/20 bg-surface/80 px-6 pb-6 pt-4">
        <View className="mb-4 flex-row items-center justify-center gap-2">
          <View className="h-1 w-8 rounded-full bg-surface-container-highest" />
          <View className="h-1 w-12 rounded-full bg-primary-container" />
          <View className="h-1 w-8 rounded-full bg-surface-container-highest" />
        </View>
        <PrimaryButton
          label="Next"
          onPress={() => router.push("/archive")}
          rightIcon="arrow-forward"
        />
      </View>
    </SafeAreaView>
  );
}
