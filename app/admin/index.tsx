import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MemoryCard } from "@/components/memory-card";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { fetchMemories } from "@/lib/memories";
import { fetchCurrentProfile } from "@/lib/profiles";
import { supabase } from "@/lib/supabase";
import type { Memory } from "@/types/memory";

export default function AdminScreen() {
  const [adminLabel, setAdminLabel] = useState("Verifying admin access...");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAdminData = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);

    try {
      const [profile, memoryList] = await Promise.all([
        fetchCurrentProfile(),
        fetchMemories(),
      ]);

      setAdminLabel(
        profile?.is_admin
          ? `Signed in as ${profile.full_name ?? "admin"}. You can delete posts below.`
          : "Admin access is not enabled for this account.",
      );
      setMemories(memoryList);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load moderation data.",
      );
      setMemories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAdminData();
    }, [loadAdminData]),
  );

  const handleRefresh = async () => {
    await loadAdminData(true);
  };

  const handleDeleteMemory = async (id: string) => {
    setDeletingId(id);

    const { error } = await supabase.from("memories").delete().eq("id", id);

    setDeletingId(null);

    if (error) {
      Alert.alert("Delete failed", error.message);
      return;
    }

    setMemories((prev) => prev.filter((memory) => memory.id !== id));
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1 px-6 pt-10"
        contentContainerClassName="gap-6 pb-24"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ffd700"
          />
        }
      >
        <Text className="font-headline text-4xl font-black tracking-tight text-primary-container">
          Admin Tools
        </Text>
        <Text className="font-body text-base leading-relaxed text-on-surface-variant">
          Admin access is tied to your Supabase profile. Delete posts directly
          from this moderation list.
        </Text>
        <View className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
          <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">
            Access
          </Text>
          <Text className="mt-2 font-body text-sm text-on-surface-variant">
            {adminLabel}
          </Text>
        </View>
        {loading ? (
          <View className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
            <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Loading posts...
            </Text>
          </View>
        ) : null}
        {loadError ? (
          <View className="rounded-xl border border-error/30 bg-error/10 p-4">
            <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-error">
              {loadError}
            </Text>
          </View>
        ) : null}
        {memories.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            showDelete
            deleting={deletingId === memory.id}
            onDelete={handleDeleteMemory}
            onPress={() =>
              router.push({
                pathname: "/memory/[id]",
                params: { id: memory.id },
              })
            }
          />
        ))}
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
