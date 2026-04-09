import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { SecondaryButton } from "@/components/secondary-button";
import { TagChip } from "@/components/tag-chip";
import { fetchMemoryById } from "@/lib/memories";
import type { Memory } from "@/types/memory";

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [memory, setMemory] = useState<Memory | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMemory = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      let nextMemory: Memory | undefined;
      try {
        nextMemory = await fetchMemoryById(id);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Could not load this memory from Supabase.";
        setLoadError(message);
        setMemory(undefined);
        setLoading(false);
        return;
      }

      if (!isMounted) {
        return;
      }

      setMemory(nextMemory);
      setLoading(false);
    };

    loadMemory();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-center font-body text-on-surface-variant">
          Loading memory...
        </Text>
      </View>
    );
  }

  if (!memory) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="mb-4 text-center font-body text-on-surface-variant">
          {loadError ?? "Memory not found."}
        </Text>
        <SecondaryButton
          label="Go back"
          onPress={() => router.back()}
          fullWidth={false}
        />
      </View>
    );
  }

  const title = memory.title ?? "The moment we finally made it.";
  const reflection = memory.reflection ?? `"${memory.quote}"`;

  return (
    <View className="flex-1 bg-surface">
      <View className="absolute left-4 top-12 z-20">
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-black/40 p-2"
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color="#fff6df" />
        </Pressable>
      </View>
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative" style={{ minHeight: 420 }}>
          <Image
            source={{ uri: memory.imageUri }}
            className="h-[480px] w-full"
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-black/35" />
          <View className="absolute bottom-8 left-0 right-0 px-8">
            <View className="mb-4 flex-row items-center gap-3">
              <View className="h-12 w-12 overflow-hidden rounded-full border-2 border-primary-container">
                <Image
                  source={{ uri: memory.avatarUri }}
                  className="h-full w-full"
                  contentFit="cover"
                />
              </View>
              <View>
                <Text className="font-headline font-bold text-primary">
                  {memory.authorName}
                </Text>
                <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {memory.authorMeta}
                </Text>
                <Text className="font-label text-[10px] uppercase tracking-widest text-primary/70">
                  {memory.university}
                </Text>
              </View>
            </View>
            <Text className="mb-2 font-headline text-3xl font-bold leading-tight text-white">
              {title}
            </Text>
            <Text className="mb-4 font-body text-lg italic leading-relaxed text-primary">
              {reflection}
            </Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
              {memory.tags.map((t) => (
                <TagChip key={t} label={t} />
              ))}
            </View>
          </View>
        </View>
        <View className="gap-8 px-8 pb-32 pt-6">
          {memory.hasVoice ? (
            <View className="rounded-lg border border-outline-variant/10 bg-surface-container-high/50 p-6">
              <View className="flex-row items-center gap-4">
                <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-primary-container">
                  <Ionicons name="play" size={28} color="#705e00" />
                </Pressable>
                <View className="flex-1 gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-label text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                      {memory.voiceLabel ?? "Voice memo"}
                    </Text>
                    <Text className="font-label text-[10px] font-medium tracking-wider text-primary">
                      {memory.voiceDuration ?? "0:00"}
                    </Text>
                  </View>
                  <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <View className="h-full w-[33%] rounded-full bg-primary-container" />
                  </View>
                </View>
                <View className="items-center gap-1 pl-2">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-container-low">
                    <Ionicons name="heart" size={24} color="#ffb4ab" />
                  </View>
                  <Text className="font-label text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                    {memory.likesCount ?? "0"}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-end">
              <View className="items-center gap-1">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-container-low">
                  <Ionicons name="heart" size={26} color="#ffb4ab" />
                </View>
                <Text className="font-label text-[11px] font-bold uppercase tracking-tighter text-on-surface-variant">
                  {memory.likesCount ?? "0"} Likes
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
