import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image as NativeImage,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MainTabBar } from "@/components/main-tab-bar";
import { SecondaryButton } from "@/components/secondary-button";
import { TagChip } from "@/components/tag-chip";
import { formatDuration } from "@/lib/audio";
import { fetchMemoryById, toggleMemoryLike } from "@/lib/memories";
import type { Memory } from "@/types/memory";

const HERO_HEIGHT = 520;

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

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [memory, setMemory] = useState<Memory | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [playBusy, setPlayBusy] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [coverLoadFailed, setCoverLoadFailed] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSeekingRef = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const resetPlaybackState = () => {
    setIsPlayingVoice(false);
    setPositionMillis(0);
    setDurationMillis(0);
  };

  useEffect(() => {
    let isMounted = true;

    const loadMemory = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const nextMemory = await fetchMemoryById(id);
        if (!isMounted) {
          return;
        }

        setMemory(nextMemory);
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
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMemory();

    return () => {
      isMounted = false;
    };
  }, [id]);

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
    setCoverLoadFailed(false);
  }, [memory?.imageUri]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [memory?.avatarUri]);

  useEffect(() => {
    setIsSeeking(false);
    if (soundRef.current) {
      void soundRef.current.unloadAsync().catch(() => {
        // Ignore cleanup races.
      });
      soundRef.current = null;
    }
    resetPlaybackState();
  }, [memory?.id]);

  const handleToggleLike = async () => {
    if (!memory || liking) {
      return;
    }

    setLiking(true);
    try {
      const result = await toggleMemoryLike(memory.id);
      setMemory((prev) =>
        prev
          ? {
              ...prev,
              likedByMe: result.liked,
              likesCount: result.likesCount,
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not toggle like.";
      Alert.alert("Like failed", message);
    } finally {
      setLiking(false);
    }
  };

  const handleToggleVoice = async () => {
    if (!memory?.voiceUrl || playBusy) {
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
  const endWords = memory.reflection?.trim() || null;
  const showCoverFallback = !memory.imageUri || coverLoadFailed;
  const avatarInitials = getInitials(memory.authorName);
  const maxDuration = Math.max(durationMillis, 1);
  const elapsedLabel = formatDuration(positionMillis);
  const totalLabel =
    durationMillis > 0
      ? formatDuration(durationMillis)
      : (memory.voiceDuration ?? "00:00");
  const imageTranslateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [-HERO_HEIGHT * 0.3, 0, -HERO_HEIGHT * 0.2],
    extrapolate: "clamp",
  });
  const imageScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0],
    outputRange: [1.45, 1],
    extrapolate: "clamp",
  });

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

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        <View
          style={{ height: HERO_HEIGHT }}
          className="relative overflow-hidden"
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                transform: [
                  { translateY: imageTranslateY },
                  { scale: imageScale },
                ],
              },
            ]}
          >
            {showCoverFallback ? (
              <View className="h-full w-full items-center justify-center bg-surface-container-high">
                <Ionicons name="image-outline" size={56} color="#d0c6ab" />
                <Text className="mt-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  No Cover Image
                </Text>
              </View>
            ) : (
              <NativeImage
                source={{ uri: memory.imageUri }}
                className="h-full w-full"
                resizeMode="cover"
                onError={() => setCoverLoadFailed(true)}
              />
            )}
          </Animated.View>
          <View className="absolute inset-0 bg-black/20" />
          <View className="absolute bottom-0 left-0 right-0 h-10 bg-black/30" />
        </View>

        <View className="-mt-10 rounded-t-[32px] bg-surface px-8 pb-36 pt-7">
          <View className="mb-8 flex-row items-center gap-4">
            <View className="h-16 w-16 overflow-hidden rounded-full border-[3px] border-primary-container bg-surface-container-highest">
              {!memory.avatarUri || avatarLoadFailed ? (
                <View className="h-full w-full items-center justify-center bg-surface-container-low">
                  <Text className="font-headline text-lg font-black tracking-tight text-primary">
                    {avatarInitials}
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: memory.avatarUri }}
                  className="h-full w-full"
                  contentFit="cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              )}
            </View>
            <View className="flex-1">
              <Text className="font-headline text-2xl font-bold leading-tight text-primary">
                {memory.authorName}
              </Text>
              <Text className="mt-0.5 font-label text-[10px] uppercase tracking-[1.4px] text-on-surface-variant">
                {memory.authorMeta} - {memory.university}
              </Text>
            </View>
          </View>

          <Text className="mb-3 font-headline text-[20px] font-bold leading-[36px] text-white">
            {title}
          </Text>
          {/* <Text className="mb-5 font-body text-base italic leading-7 text-primary/90">
            {narrative}
          </Text> */}

          {endWords ? (
            <View className="mb-7 rounded-2xl border border-outline-variant/10 bg-surface-container-high/40 p-4">
              <Text className="mb-2 font-label text-[10px] uppercase tracking-[0.18em] text-primary/85">
                End Words
              </Text>
              <Text className="font-body text-sm leading-6 text-white/90">
                {endWords}
              </Text>
            </View>
          ) : null}

          <View className="mb-10 flex-row flex-wrap gap-3">
            {memory.tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </View>

          {memory.hasVoice ? (
            <View className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/55 p-6">
              <View className="flex-row items-center gap-4">
                <Pressable
                  onPress={handleToggleVoice}
                  disabled={!memory.voiceUrl || playBusy}
                  className="h-12 w-12 items-center justify-center rounded-full bg-primary-container"
                >
                  <Ionicons
                    name={isPlayingVoice ? "pause" : "play"}
                    size={28}
                    color="#705e00"
                  />
                </Pressable>
                <View className="flex-1 gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-label text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                      {memory.voiceLabel ?? "Voice memo"}
                    </Text>
                    <Text className="font-label text-[11px] font-bold tracking-wider text-primary">
                      {totalLabel}
                    </Text>
                  </View>
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
                  <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/80">
                    {elapsedLabel} / {totalLabel}
                  </Text>
                </View>
                <Pressable
                  onPress={handleToggleLike}
                  disabled={liking}
                  className="items-center gap-1 pl-2"
                >
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-container-low">
                    <Ionicons
                      name={memory.likedByMe ? "heart" : "heart-outline"}
                      size={24}
                      color={memory.likedByMe ? "#ff5a70" : "#ffb4ab"}
                    />
                  </View>
                  <Text className="font-label text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                    {memory.likesCount ?? "0"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/40 p-5">
              <Text className="mb-3 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                No voice memo attached
              </Text>
              <View className="flex-row items-center justify-end">
                <Pressable
                  onPress={handleToggleLike}
                  disabled={liking}
                  className="items-center gap-1"
                >
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-container-low">
                    <Ionicons
                      name={memory.likedByMe ? "heart" : "heart-outline"}
                      size={26}
                      color={memory.likedByMe ? "#ff5a70" : "#ffb4ab"}
                    />
                  </View>
                  <Text className="font-label text-[11px] font-bold  tracking-tighter text-on-surface-variant">
                    {memory.likesCount ?? "0"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Animated.ScrollView>
      <MainTabBar />
    </View>
  );
}
