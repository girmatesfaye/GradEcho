import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import type { Memory } from "@/types/memory";

import { TagChip } from "@/components/tag-chip";

type Props = {
  memory: Memory;
  onPress?: () => void;
  variant?: "feed" | "profile";
};

export function MemoryCard({ memory, onPress, variant = "feed" }: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      className="mb-10"
    >
      <View className="mb-4 flex-row items-center gap-3 px-2">
        <View className="h-12 w-12 overflow-hidden rounded-full bg-surface-container-highest">
          <Image
            source={{ uri: memory.avatarUri }}
            className="h-full w-full"
            contentFit="cover"
          />
        </View>
        <View>
          <Text className="font-headline text-base font-bold leading-tight text-primary">
            {memory.authorName}
          </Text>
          <Text className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            {memory.authorMeta}
          </Text>
          <Text className="mt-0.5 font-label text-[10px] uppercase tracking-widest text-primary-container/70">
            {memory.university}
          </Text>
        </View>
      </View>
      <View
        className={`relative overflow-hidden bg-surface-container-lowest ${
          variant === "profile" ? "rounded-2xl" : "rounded-lg"
        }`}
        style={{ aspectRatio: 4 / 5 }}
      >
        {variant === "profile" ? (
          <Pressable
            accessibilityLabel="Delete memory"
            className="absolute right-4 top-4 z-10 rounded-full bg-surface-container-lowest/40 p-2"
          >
            <Ionicons name="trash-outline" size={18} color="#d0c6ab" />
          </Pressable>
        ) : null}
        <Image
          source={{ uri: memory.imageUri }}
          className="h-full w-full"
          contentFit="cover"
        />
        <View className="absolute inset-0 bg-black/55" />
        <View className="absolute bottom-0 left-0 right-0 p-6">
          <Text className="mb-6 font-body text-lg italic leading-relaxed text-primary">
            &ldquo;{memory.quote}&rdquo;
          </Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {memory.tags.map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </View>
          <View className="flex-row items-center justify-between">
            <Pressable className="flex-row items-center gap-2 rounded-full border border-primary-container/20 bg-primary-container/10 px-4 py-2">
              <Ionicons name="play-circle" size={22} color="#ffd700" />
              <Text className="font-label text-xs font-bold uppercase tracking-widest text-primary-container">
                {variant === "profile" ? "Listen" : "Listen to Memory"}
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-3">
              {memory.dateLabel ? (
                <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
                  {memory.dateLabel}
                </Text>
              ) : (
                <View className="flex-row items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                  <Ionicons name="heart" size={18} color="#fff6df" />
                  <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">
                    {memory.likesCount ?? "0"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
