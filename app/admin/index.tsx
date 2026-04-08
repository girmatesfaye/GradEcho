import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { fetchCurrentProfile } from "@/lib/profiles";

export default function AdminScreen() {
  const [adminLabel, setAdminLabel] = useState("Verifying admin access...");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const profile = await fetchCurrentProfile();

      if (!isMounted) {
        return;
      }

      setAdminLabel(
        profile?.is_admin
          ? `Signed in as ${profile.full_name ?? "admin"}. Moderation is enforced by Supabase RLS.`
          : "Admin access is not enabled for this account.",
      );
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1 px-6 pt-10"
        contentContainerClassName="gap-6 pb-24"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text className="font-headline text-4xl font-black tracking-tight text-primary-container">
          Admin Tools
        </Text>
        <Text className="font-body text-base leading-relaxed text-on-surface-variant">
          This screen is now tied to the signed-in Supabase profile. Only users
          marked as admins can keep access to this route and delete feed posts.
        </Text>
        <View className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
          <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">
            Access
          </Text>
          <Text className="mt-2 font-body text-sm text-on-surface-variant">
            {adminLabel}
          </Text>
        </View>
        <PrimaryButton
          label="Back to Home"
          onPress={() => router.replace("/home")}
        />
        <SecondaryButton
          label="Go to Profile"
          onPress={() => router.push("/profile")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
