import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MemoryCard } from "@/components/memory-card";
import { PrimaryButton } from "@/components/primary-button";
import { isAuthExpiredErrorMessage } from "@/lib/auth-errors";
import { fetchMemories } from "@/lib/memories";
import { supabase } from "@/lib/supabase";
import type { Memory } from "@/types/memory";

export default function AdminScreen() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleBack = () => {
    router.replace("/home");
  };

  const loadAdminData = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);

    try {
      const memoryList = await fetchMemories();

      setMemories(memoryList);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load moderation data.";
      if (isAuthExpiredErrorMessage(message)) {
        Alert.alert(
          "Please login",
          "Your session expired. Please login again.",
        );
        router.replace("/login?reason=expired");
        return;
      }
      setLoadError(message);
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
      if (isAuthExpiredErrorMessage(error.message)) {
        Alert.alert(
          "Please login",
          "Your session expired. Please login again.",
        );
        router.replace("/login?reason=expired");
        return;
      }
      Alert.alert("Delete failed", error.message);
      return;
    }

    setMemories((prev) => prev.filter((memory) => memory.id !== id));
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <View className="border-b border-outline-variant/10 bg-surface/95 px-6 pt-4 pb-4">
        <Text className="mb-3 font-headline text-2xl font-black tracking-tight text-primary-container">
          Admin Center
        </Text>
        <PrimaryButton label="Back" onPress={handleBack} />
      </View>
      <ScrollView
        className="flex-1 px-6 pt-6"
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
      </ScrollView>
    </SafeAreaView>
  );
}
