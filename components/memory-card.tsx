import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { GestureResponderEvent, Pressable, Text, View } from "react-native";

import type { Memory } from "@/types/memory";

import { TagChip } from "@/components/tag-chip";

type Props = {
  memory: Memory;
  onPress?: () => void;
  variant?: "feed" | "profile";
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  onToggleLike?: (id: string) => void;
  liking?: boolean;
  deleting?: boolean;
};

function truncateText(text: string, limit: number) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= limit) {
    return compact;
  }

  return `${compact.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

export function MemoryCard({
  memory,
  onPress,
  variant = "feed",
  showDelete = false,
  onDelete,
  onToggleLike,
  liking = false,
  deleting = false,
}: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [playBusy, setPlayBusy] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        void soundRef.current.unloadAsync().catch(() => {
          // Ignore cleanup races.
        });
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [memory.imageUri]);

  const handleDelete = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onDelete?.(memory.id);
  };

  const handleToggleLike = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!liking) {
      onToggleLike?.(memory.id);
    }
  };

  const handleToggleVoice = async (e: GestureResponderEvent) => {
    e.stopPropagation();

    if (!memory.voiceUrl || playBusy) {
      return;
    }

    try {
      setPlayBusy(true);

      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlayingVoice(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlayingVoice(true);
        }

        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: memory.voiceUrl },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) {
            return;
          }

          setIsPlayingVoice(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlayingVoice(false);
          }
        },
      );

      soundRef.current = sound;
      setIsPlayingVoice(true);
    } catch {
      setIsPlayingVoice(false);
    } finally {
      setPlayBusy(false);
    }
  };

  const showImageFallback = !memory.imageUri || imageLoadFailed;
  const narrativeSource = memory.title?.trim() || memory.quote;
  const endWordsSource = memory.reflection?.trim() || memory.quote;
  const narrativePreview = truncateText(narrativeSource, 56);
  const endWordsPreview = truncateText(endWordsSource, variant === "feed" ? 140 : 110);

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
        {variant === "profile" || showDelete ? (
          <Pressable
            accessibilityLabel="Delete memory"
            onPress={handleDelete}
            disabled={deleting}
            className="absolute right-4 top-4 z-10 rounded-full bg-surface-container-lowest/40 p-2"
          >
            <Ionicons
              name={deleting ? "hourglass-outline" : "trash-outline"}
              size={18}
              color="#d0c6ab"
            />
          </Pressable>
        ) : null}
        {showImageFallback ? (
          <View className="h-full w-full items-center justify-center bg-surface-container-high">
            <Ionicons name="image-outline" size={44} color="#d0c6ab" />
            <Text className="mt-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              No Cover Image
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: memory.imageUri }}
            className="h-full w-full"
            contentFit="cover"
            onError={() => setImageLoadFailed(true)}
          />
        )}
        <View className="absolute inset-0 bg-black/55" />
        <View className="absolute bottom-0 left-0 right-0 p-6">
          <Text className="mb-2 font-headline text-2xl font-bold leading-tight text-primary">
            {narrativePreview}
          </Text>
          <Text className="mb-6 font-body text-base italic leading-relaxed text-primary">
            {endWordsPreview}
          </Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {memory.tags.map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </View>
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={handleToggleVoice}
              disabled={!memory.voiceUrl || playBusy}
              className={`flex-row items-center gap-2 rounded-full border px-4 py-2 ${
                memory.voiceUrl
                  ? "border-primary-container/20 bg-primary-container/10"
                  : "border-outline-variant/20 bg-surface-container-low/40"
              }`}
            >
              <Ionicons
                name={isPlayingVoice ? "pause-circle" : "play-circle"}
                size={22}
                color={memory.voiceUrl ? "#ffd700" : "#9b9178"}
              />
              <Text className="font-label text-xs font-bold uppercase tracking-widest text-primary-container">
                {!memory.voiceUrl
                  ? "No Voice"
                  : variant === "profile"
                    ? isPlayingVoice
                      ? "Pause"
                      : "Listen"
                    : isPlayingVoice
                      ? "Pause Memory"
                      : "Listen to Memory"}
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-3">
              {memory.dateLabel ? (
                <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
                  {memory.dateLabel}
                </Text>
              ) : (
                <Pressable
                  onPress={handleToggleLike}
                  disabled={liking}
                  className="flex-row items-center gap-2 rounded-full bg-white/5 px-3 py-2"
                >
                  <Ionicons
                    name={memory.likedByMe ? "heart" : "heart-outline"}
                    size={18}
                    color={memory.likedByMe ? "#ff5a70" : "#fff6df"}
                  />
                  <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">
                    {memory.likesCount ?? "0"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
