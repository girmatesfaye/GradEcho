import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { FeedHeader } from "@/components/feed-header";
import { MemoryCard } from "@/components/memory-card";
import { SupportModal } from "@/components/support-modal";
import { isAuthExpiredErrorMessage } from "@/lib/auth-errors";
import { fetchMemories, toggleMemoryLike } from "@/lib/memories";
import { fetchCurrentProfile } from "@/lib/profiles";
import type { Memory } from "@/types/memory";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDigwncOBpv2TXfewZ5ZQuJATfKG2H0vfcY5AzyUY2SmhrK72YjKvnNn3dTRKb79BPr100UkJEBb1-CLhQwi7bQTw2M2jGVH-1gErJP3W2GvT1oeWTSZxLoCiZ1Z74Ef6y8Incvc0M0hM86RyHCDLSafFCW991BKHCrVao7FjOsKbyIWPLFrGI-m0tVFby1TK0x7GpDAxqq1TgRt-qqZdo3fjWNGVCuWckcLk-iybxqGS7h99Fjfaoh5ZxyR9KpGCPGQXr_pp9n0SJh";

const FILTERS = ["All", "My University", "My Department", "My Batch"] as const;
type FeedFilter = (typeof FILTERS)[number];

function normalizeComparable(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export default function HomeFeedScreen() {
  const [avatarUri, setAvatarUri] = useState(AVATAR);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FeedFilter>("All");
  const [myUniversity, setMyUniversity] = useState<string | null>(null);
  const [myDepartment, setMyDepartment] = useState<string | null>(null);
  const [myBatch, setMyBatch] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const loadMemories = useCallback(
    async (mode: "initial" | "refresh" | "background" = "initial") => {
      if (mode === "initial") {
        setLoading(true);
      }

      if (mode === "refresh") {
        setRefreshing(true);
      }

      if (mode !== "background") {
        setLoadError(null);
      }

      const [memoriesResult, profileResult] = await Promise.allSettled([
        fetchMemories(),
        fetchCurrentProfile(),
      ]);

      if (memoriesResult.status === "fulfilled") {
        setMemories(memoriesResult.value);
      } else {
        const message =
          memoriesResult.reason instanceof Error
            ? memoriesResult.reason.message
            : "Could not load memories.";
        if (isAuthExpiredErrorMessage(message)) {
          Alert.alert(
            "Please login",
            "Your session expired. Please login again.",
          );
          router.replace("/login?reason=expired");
          return;
        }

        if (mode !== "background") {
          setMemories([]);
          setLoadError(message);
        }
      }

      if (profileResult.status === "fulfilled") {
        const profile = profileResult.value;
        const safeName = profile?.full_name?.trim();
        if (profile?.is_admin) {
          router.replace("/admin");
          setLoading(false);
          setRefreshing(false);
          hasLoadedOnceRef.current = true;
          return;
        }
        setMyUniversity(profile?.university ?? null);
        setMyDepartment(profile?.department ?? null);
        setMyBatch(profile?.graduation_year ?? null);
        setAvatarUri(
          profile?.avatar_url ??
            (safeName
              ? `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(safeName)}`
              : AVATAR),
        );
      } else if (mode !== "background") {
        setMyUniversity(null);
        setMyDepartment(null);
        setMyBatch(null);
        setAvatarUri(AVATAR);
      }

      setLoading(false);
      setRefreshing(false);
      hasLoadedOnceRef.current = true;
    },
    [],
  );

  useEffect(() => {
    void loadMemories("initial");
  }, [loadMemories]);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedOnceRef.current) {
        void loadMemories("background");
      }
    }, [loadMemories]),
  );

  const handleRefresh = async () => {
    await loadMemories("refresh");
  };

  const handleBuyCoffee = async () => {
    setShowSupportModal(false);

    try {
      await Linking.openURL("https://gurshaplus.com/girmatesfaye");
    } catch {
      Alert.alert("Could not open link", "Please try again in a moment.");
    }
  };

  const handleToggleLike = async (id: string) => {
    setLikingId(id);

    try {
      const result = await toggleMemoryLike(id);
      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === id
            ? {
                ...memory,
                likedByMe: result.liked,
                likesCount: result.likesCount,
              }
            : memory,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not toggle like.";
      Alert.alert("Like failed", message);
    } finally {
      setLikingId(null);
    }
  };

  const filteredMemories = useMemo(() => {
    if (selectedFilter === "All") {
      return memories;
    }

    if (selectedFilter === "My University") {
      const target = normalizeComparable(myUniversity);
      if (!target) {
        return memories;
      }

      return memories.filter(
        (memory) => normalizeComparable(memory.university) === target,
      );
    }

    if (selectedFilter === "My Department") {
      const target = normalizeComparable(myDepartment);
      if (!target) {
        return memories;
      }

      return memories.filter(
        (memory) => normalizeComparable(memory.authorMeta) === target,
      );
    }

    const target = normalizeComparable(myBatch);
    if (!target) {
      return memories;
    }

    return memories.filter(
      (memory) => normalizeComparable(memory.authorBatch) === target,
    );
  }, [memories, myBatch, myDepartment, myUniversity, selectedFilter]);

  return (
    <View className="flex-1 bg-surface">
      <FeedHeader
        actionType="coffee"
        onActionPress={() => {
          setShowSupportModal(true);
        }}
      />
      <SupportModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        onConfirm={() => {
          void handleBuyCoffee();
        }}
      />
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerClassName="pb-32"
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
          <View className="mb-4 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3">
            <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Loading memories...
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8 flex-row gap-3 py-2"
          contentContainerClassName="gap-3 pr-4"
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setSelectedFilter(f)}
              className={`rounded-full px-6 py-2.5 ${selectedFilter === f ? "bg-primary-container" : "border border-outline-variant/15 bg-surface-container-low"}`}
            >
              <Text
                className={`font-headline text-sm font-semibold ${selectedFilter === f ? "text-on-primary-container" : "text-on-surface-variant"}`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {!loading && filteredMemories.length === 0 ? (
          <View className="mb-4 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-4">
            <Text className="text-center font-body text-on-surface-variant">
              {selectedFilter === "All"
                ? "No memories found yet. Share the first memory to start the feed."
                : "No data with this filter."}
            </Text>
          </View>
        ) : null}
        {filteredMemories.map((m) => (
          <MemoryCard
            key={m.id}
            memory={m}
            onToggleLike={handleToggleLike}
            liking={likingId === m.id}
            onPress={() =>
              router.push({ pathname: "/memory/[id]", params: { id: m.id } })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
