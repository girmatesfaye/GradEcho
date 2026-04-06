import { PrimaryButton } from "@/components/primary-button";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3SI7ZozL6Ty8bYxPxcPEgufRNu54weHaJWR1Nksas5LNYUcjp3LtkCAnWPHo96TibgdFMcfhCUwHQvX1w4TfD3D7JNf69Xqmu3fSCIshRpJjqhvdWreph__lu9QAOmV7cNpRyq-M8XdXAsxpJECXEK7VGzJeKWiJVYHwtn06L3Pc9ePDA6d1_mmkPe6RqOKPWj8ezSf6-OmCqll4-Zt2GNwj8iYCUWFK_TzG26MMnb-LIHfucTtzgwNHEMZpjqoBNGsSeo8mqcHWm";

const USER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAH2kjIoZLn6ZXpKx6f3Mmfx0sclCivIJdkRXHOAUqtqL-vGa-VmQhhpyrxVhrQ4Uldi3Aw2pKNOZVmC3UX-a_59oQRx0Ue8JewbVw-Xra6t3_nvTH2505UsDjN6-xrkebk7CSCF5bjMTN4IqapIiZw6Dw_dUl_HiXSv1IVptje0t_m05CS-ivDVFxy-NWBdXlKUI5v_WCtSUpPxp8N_ozGErVcZhLwq1moW7HW4pJWkg8zPamp_BfBVESacvtXVimMbfwUs1VhdxtK";

export default function CreateMemoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between bg-surface/80 px-6 py-4">
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="close" size={28} color="#ffd700" />
            </Pressable>
            <Text className="font-headline text-xl font-black tracking-tighter text-primary-container">
              GradEcho
            </Text>
          </View>
          <View className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant/20">
            <Image
              source={{ uri: USER }}
              className="h-full w-full"
              contentFit="cover"
            />
          </View>
        </View>
        <ScrollView
          className="flex-1 px-6 pt-8"
          contentContainerClassName="pb-16"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text className="mb-2 font-headline text-4xl font-bold tracking-tight text-primary">
            Immortalize the Moment
          </Text>
          <Text className="mb-10 font-body text-lg text-on-surface-variant">
            Every frame tells a story of your journey.
          </Text>
          <View className="relative mb-8 overflow-hidden rounded-lg bg-surface-container-low">
            <View className="aspect-[16/10] w-full items-center justify-center">
              <Image
                source={{ uri: HERO }}
                className="absolute inset-0 h-full w-full opacity-40"
                contentFit="cover"
              />
              <View className="z-10 items-center gap-4">
                <View className="h-16 w-16 items-center justify-center rounded-full border border-outline-variant/15 bg-surface-container-high/80">
                  <Ionicons name="camera" size={32} color="#fff6df" />
                </View>
                <Text className="font-label text-sm uppercase tracking-[0.1em] text-primary">
                  Upload Visual Memory
                </Text>
              </View>
            </View>
          </View>
          <View className="mb-8 rounded-lg border border-outline-variant/10 bg-surface-container-high/40 p-6">
            <Text className="mb-4 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              The Narrative
            </Text>
            <View className="flex-row items-start gap-4">
              <TextInput
                multiline
                placeholder="How do you feel?"
                placeholderTextColor="#353534"
                className="min-h-[100px] flex-1 font-headline text-xl text-on-surface"
              />
              <Pressable className="h-14 w-14 items-center justify-center rounded-full bg-primary-container">
                <Ionicons name="mic" size={26} color="#3a3000" />
              </Pressable>
            </View>
          </View>
          {/* <Pressable className="mb-6 flex-row items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-high/40 p-6">
          <View className="flex-row items-center gap-4">
            <Ionicons name="location-outline" size={24} color="#d0c6ab" />
            <View>
              <Text className="font-headline font-semibold text-on-surface">Campus Tag</Text>
              <Text className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                Main University Plaza
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#d0c6ab" />
        </Pressable> */}
          <View className="mb-6 rounded-lg border border-outline-variant/10 bg-surface-container-high/40 p-6">
            <Text className="mb-4 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              End Words
            </Text>
            <TextInput
              multiline
              placeholder="Your final words to the class..."
              placeholderTextColor="#353534"
              className="min-h-[80px] font-headline text-xl text-on-surface"
            />
          </View>
          <View className="mb-8 flex-row items-center gap-4 rounded-lg border border-outline-variant/10 bg-surface-container-high/40 p-6">
            <Ionicons name="pricetag-outline" size={24} color="#d0c6ab" />
            <View className="flex-1">
              <Text className="mb-1 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Memory Tags
              </Text>
              <TextInput
                placeholder="Add tags (e.g., #graduation #memories)"
                placeholderTextColor="#353534"
                className="font-body text-base text-on-surface"
              />
            </View>
          </View>
          <PrimaryButton
            label="Share Memory"
            onPress={() => router.back()}
            className="h-16"
            textClassName="font-headline text-xl font-extrabold tracking-tight"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
