import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { FeedHeader } from "@/components/feed-header";
import { MemoryCard } from "@/components/memory-card";
import { fetchMemoriesByUserId } from "@/lib/memories";
import { fetchCurrentProfile } from "@/lib/profiles";
import { supabase } from "@/lib/supabase";
import type { Memory } from "@/types/memory";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5mO7GArcByAeXNz-sZ1-AMeU53V4H6qnZMAAzif-HqYGpQH9sisieHwLQeDX0iDxwSVmaG17bqwKXmz5fIlCk0Ga8CGq2ojNFhZDdBBxRmUi0PhclcW8MC2cwIoO1fPxjqLot4xAVQYrJZKKUO62ZfUf8RyqJ1kdEw9XPM34V7XkVFPVaMyptlzoKNvgZinOmrp4tpbzzCpIn6JA83McF1sjPVOCaMX9YRET3b8yKCsMaQi8fDOmDXqbXQN7VJExQzYJfRDYQA5OD";

function formatArchiveDate(createdAt?: string) {
  if (!createdAt) {
    return "Unknown date";
  }

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function parseLikesCount(value?: string) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value.replaceAll(",", ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function ProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [metaLine, setMetaLine] = useState("");
  const [university, setUniversity] = useState("");
  const [avatarUri, setAvatarUri] = useState(AVATAR);
  const [archive, setArchive] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setLoadError(null);

      const profile = await fetchCurrentProfile();

      if (!isMounted) {
        return;
      }

      if (!profile) {
        setArchive([]);
        setLoadError("Could not load your profile. Please sign in again.");
        setLoading(false);
        return;
      }

      const safeName = profile.full_name?.trim() || "GradEcho Member";
      const safeDepartment = profile.department?.trim() || "Member";
      const safeYear = profile.graduation_year?.trim() || "";
      const nextMeta = `${safeDepartment}${safeYear ? ` ${safeYear}` : ""}`;
      const safeUniversity = profile.university?.trim() || "University not set";
      const nextAvatar =
        profile.avatar_url ??
        `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(safeName)}`;

      setFullName(safeName);
      setMetaLine(nextMeta);
      setUniversity(safeUniversity);
      setAvatarUri(nextAvatar);

      try {
        const memories = await fetchMemoriesByUserId(profile.id);

        if (!isMounted) {
          return;
        }

        setArchive(
          memories.map((memory) => ({
            ...memory,
            dateLabel: formatArchiveDate(memory.createdAt),
          })),
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Could not load your profile archive from Supabase.";
        setArchive([]);
        setLoadError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalMemories = archive.length;
  const totalVoiceMemories = useMemo(
    () => archive.filter((memory) => memory.hasVoice).length,
    [archive],
  );
  const totalEchoes = useMemo(
    () =>
      archive.reduce(
        (sum, memory) => sum + parseLikesCount(memory.likesCount),
        0,
      ),
    [archive],
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Logout failed", error.message);
      return;
    }

    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-surface">
      <FeedHeader actionType="logout" onActionPress={handleLogout} />
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerClassName="pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        {loading ? (
          <View className="mb-4 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3">
            <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Loading profile from Supabase...
            </Text>
          </View>
        ) : null}
        {loadError ? (
          <View className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3">
            <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-error">
              {loadError}
            </Text>
          </View>
        ) : null}
        <View className="mb-10 flex-row items-center gap-4 px-2">
          <View className="relative">
            <View className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary-container p-0.5">
              <View className="h-full w-full overflow-hidden rounded-full border-2 border-surface">
                <Image
                  source={{ uri: avatarUri }}
                  className="h-full w-full"
                  contentFit="cover"
                />
              </View>
            </View>
            <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-primary-container">
              <Ionicons name="checkmark" size={14} color="#705e00" />
            </View>
          </View>
          <View>
            {fullName ? (
              <Text className="font-headline text-2xl font-bold leading-tight text-primary">
                {fullName}
              </Text>
            ) : null}
            {metaLine ? (
              <Text className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {metaLine}
              </Text>
            ) : null}
            {university ? (
              <Text className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container/70">
                {university}
              </Text>
            ) : null}
          </View>
        </View>
        <View className="mb-10 flex-row items-center justify-between rounded-2xl border border-outline-variant/10 bg-surface-container-low/40 p-6">
          <View className="flex-1 items-center">
            <Text className="font-headline text-xl font-bold text-primary">
              {totalMemories}
            </Text>
            <Text className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              Memories
            </Text>
          </View>
          <View className="h-8 w-px bg-outline-variant/20" />
          <View className="flex-1 items-center">
            <Text className="font-headline text-xl font-bold text-primary">
              {totalVoiceMemories}
            </Text>
            <Text className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              Voice
            </Text>
          </View>
        </View>
        <View className="mb-6 flex-row items-baseline justify-between px-2">
          <Text className="font-headline text-lg font-bold text-primary">
            Personal Archive
          </Text>
          <Text className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
            Chronological
          </Text>
        </View>
        {!loading && archive.length === 0 ? (
          <View className="mb-4 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-4">
            <Text className="text-center font-body text-on-surface-variant">
              No memories in your archive yet.
            </Text>
          </View>
        ) : null}
        {archive.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} variant="profile" />
        ))}
      </ScrollView>
    </View>
  );
}
