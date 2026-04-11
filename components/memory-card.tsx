import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import { TagChip } from "@/components/tag-chip";
import { formatDuration } from "@/lib/audio";
import type { Memory } from "@/types/memory";

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

  return `${compact.slice(0, Math.max(0, limit - 3)).trimEnd()}...`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "GM";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
  const isSeekingRef = useRef(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [playBusy, setPlayBusy] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const resetPlaybackState = () => {
    setIsPlayingVoice(false);
    setPositionMillis(0);
    setDurationMillis(0);
  };

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
    isSeekingRef.current = isSeeking;
  }, [isSeeking]);

  useEffect(() => {
    setIsSeeking(false);
    if (soundRef.current) {
      void soundRef.current.unloadAsync().catch(() => {
        // Ignore cleanup races.
      });
      soundRef.current = null;
    }
    resetPlaybackState();
  }, [memory.id]);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [memory.imageUri]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [memory.avatarUri]);

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
        } else if (status.isLoaded) {
          if (
            typeof status.durationMillis === "number" &&
            status.durationMillis > 0 &&
            status.positionMillis >= status.durationMillis
          ) {
            await soundRef.current.setPositionAsync(0);
            setPositionMillis(0);
          }
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

          if (!isSeekingRef.current) {
            setPositionMillis(status.positionMillis);
          }
          if (typeof status.durationMillis === "number") {
            setDurationMillis(status.durationMillis);
          }
          setIsPlayingVoice(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlayingVoice(false);
            setPositionMillis(status.durationMillis ?? status.positionMillis);
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

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekComplete = async (value: number) => {
    setIsSeeking(false);
    setPositionMillis(value);

    if (!soundRef.current) {
      return;
    }

    try {
      await soundRef.current.setPositionAsync(value);
    } catch {
      // Ignore seek errors and keep current UI state.
    }
  };

  const showImageFallback = !memory.imageUri || imageLoadFailed;
  const narrativeSource = memory.title?.trim() || "Untitled Memory";
  const endWordsSource = memory.reflection?.trim() || "";
  const narrativePreview = truncateText(narrativeSource, 56);
  const endWordsPreview = endWordsSource
    ? truncateText(endWordsSource, variant === "feed" ? 120 : 95)
    : "";
  const avatarInitials = getInitials(memory.authorName);
  const maxDuration = Math.max(durationMillis, 1);
  const elapsedLabel = formatDuration(positionMillis);
  const totalLabel =
    durationMillis > 0
      ? formatDuration(durationMillis)
      : (memory.voiceDuration ?? "00:00");

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      className="mb-10"
    >
      <View className="mb-4 flex-row items-center gap-3 px-2">
        <View className="h-12 w-12 overflow-hidden rounded-full bg-surface-container-highest">
          {!memory.avatarUri || avatarLoadFailed ? (
            <View className="h-full w-full items-center justify-center bg-surface-container-low">
              <Text className="font-headline text-sm font-black tracking-tight text-primary">
                {avatarInitials}
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: memory.avatarUri }}
              className="h-full w-full"
              resizeMode="cover"
              onError={() => setAvatarLoadFailed(true)}
            />
          )}
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
            resizeMode="cover"
            onError={() => setImageLoadFailed(true)}
          />
        )}

        <View className="absolute inset-0 bg-black/55" />
        <View className="absolute bottom-0 left-0 right-0 p-6">
          <Text className="mb-2 font-headline text-xl font-bold leading-tight text-primary">
            {narrativePreview}
          </Text>
          {endWordsPreview ? (
            <Text className="mb-6 font-body text-sm italic leading-relaxed text-primary">
              {endWordsPreview}
            </Text>
          ) : null}

          <View className="mb-6 flex-row flex-wrap gap-2">
            {memory.tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
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
                    : isPlayingVoice
                      ? "Pause"
                      : "Play"}
                </Text>
              </Pressable>
            </View>

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

          {memory.voiceUrl ? (
            <View className="mt-4">
              <Slider
                style={{ width: "100%", height: 20 }}
                value={positionMillis}
                minimumValue={0}
                maximumValue={maxDuration}
                minimumTrackTintColor="#ffd700"
                maximumTrackTintColor="rgba(255, 246, 223, 0.25)"
                thumbTintColor="#ffd700"
                onSlidingStart={handleSeekStart}
                onValueChange={(value) => setPositionMillis(value)}
                onSlidingComplete={handleSeekComplete}
              />
              <View className="mt-1 flex-row items-center justify-between">
                <Text className="font-label text-[10px] uppercase tracking-widest text-white/75">
                  {elapsedLabel}
                </Text>
                <Text className="font-label text-[10px] uppercase tracking-widest text-white/75">
                  {totalLabel}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
