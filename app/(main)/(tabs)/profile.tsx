import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";

import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { FeedHeader } from "@/components/feed-header";
import { MemoryCard } from "@/components/memory-card";
import { PrimaryButton } from "@/components/primary-button";
import { isAuthExpiredErrorMessage } from "@/lib/auth-errors";
import { fetchMemoriesByUserId } from "@/lib/memories";
import { fetchCurrentProfile, updateProfileAvatar } from "@/lib/profiles";
import { uploadProfileAvatar } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { Memory } from "@/types/memory";

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

export default function ProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [metaLine, setMetaLine] = useState("");
  const [university, setUniversity] = useState("");
  const [avatarUri, setAvatarUri] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [archive, setArchive] = useState<Memory[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteMemory, setPendingDeleteMemory] = useState<Memory | null>(
    null,
  );
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
        setIsAdmin(false);
        setLoadError("Please login to continue.");
        setLoading(false);
        Alert.alert(
          "Please login",
          "Your session expired. Please login again.",
        );
        router.replace("/login?reason=expired");
        return;
      }

      const safeName = profile.full_name?.trim() || "GradEcho Member";
      const safeDepartment = profile.department?.trim() || "Member";
      const safeYear = profile.graduation_year?.trim() || "";
      const nextMeta = `${safeDepartment}${safeYear ? ` ${safeYear}` : ""}`;
      const safeUniversity = profile.university?.trim() || "University not set";

      setFullName(safeName);
      setMetaLine(nextMeta);
      setUniversity(safeUniversity);
      setAvatarUri(profile.avatar_url ?? "");
      setProfileId(profile.id);
      setIsAdmin(profile.is_admin);

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
            : "Could not load your profile archive.";
        if (isAuthExpiredErrorMessage(message)) {
          Alert.alert(
            "Please login",
            "Your session expired. Please login again.",
          );
          router.replace("/login?reason=expired");
          return;
        }
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

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUri]);

  const avatarInitials = getInitials(fullName || "GradEcho Member");

  const totalMemories = archive.length;
  const totalVoiceMemories = useMemo(
    () => archive.filter((memory) => memory.hasVoice).length,
    [archive],
  );

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoggingOut(false);
      Alert.alert("Logout failed", error.message);
      return;
    }

    router.replace("/login");
  };

  const handleAvatarUpload = async () => {
    if (uploadingAvatar) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to update your profile image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
      base64: false,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });

    if (result.canceled) {
      return;
    }

    const picked = result.assets[0]?.uri;
    if (!picked) {
      Alert.alert("No image selected", "Please choose an image and try again.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const currentProfileId = profileId ?? user?.id ?? null;
    if (userError || !currentProfileId) {
      Alert.alert("Please login", "Your session expired. Please login again.");
      router.replace("/login?reason=expired");
      return;
    }

    setUploadingAvatar(true);

    try {
      const uploadedAvatar = await uploadProfileAvatar({
        userId: currentProfileId,
        uri: picked,
      });

      await updateProfileAvatar(currentProfileId, uploadedAvatar.path);
      setAvatarUri(`${uploadedAvatar.signedUrl}&t=${Date.now()}`);
      setProfileId(currentProfileId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not update profile image.";
      if (isAuthExpiredErrorMessage(message)) {
        Alert.alert(
          "Please login",
          "Your session expired. Please login again.",
        );
        router.replace("/login?reason=expired");
        return;
      }
      Alert.alert("Upload failed", message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRequestDeleteMemory = (id: string) => {
    const selected = archive.find((memory) => memory.id === id) ?? null;
    setPendingDeleteMemory(selected);
  };

  const handleCancelDeleteMemory = () => {
    if (deletingId) {
      return;
    }
    setPendingDeleteMemory(null);
  };

  const handleConfirmDeleteMemory = async () => {
    if (!pendingDeleteMemory || deletingId) {
      return;
    }

    setDeletingId(pendingDeleteMemory.id);

    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", pendingDeleteMemory.id);

    if (error) {
      setDeletingId(null);

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

    setArchive((prev) =>
      prev.filter((memory) => memory.id !== pendingDeleteMemory.id),
    );
    setPendingDeleteMemory(null);
    setDeletingId(null);
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
              Loading profile...
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
                {!avatarUri || avatarLoadFailed ? (
                  <View className="h-full w-full items-center justify-center bg-surface-container-low">
                    <Text className="font-headline text-xl font-black tracking-tight text-primary">
                      {avatarInitials}
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: avatarUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                )}
              </View>
            </View>
            <Pressable
              onPress={() => {
                void handleAvatarUpload();
              }}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-primary-container"
            >
              <Ionicons
                name={uploadingAvatar ? "hourglass-outline" : "pencil"}
                size={14}
                color="#705e00"
              />
            </Pressable>
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
        {isAdmin ? (
          <View className="mb-8 px-2">
            <PrimaryButton
              label="Open Admin Center"
              onPress={() => router.push("/admin")}
            />
          </View>
        ) : null}
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
          <MemoryCard
            key={memory.id}
            memory={memory}
            variant="profile"
            deleting={deletingId === memory.id}
            onDelete={handleRequestDeleteMemory}
          />
        ))}
      </ScrollView>
      {loggingOut ? (
        <View className="absolute inset-0 items-center justify-center bg-surface">
          <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Signing out...
          </Text>
        </View>
      ) : null}
      <DeleteConfirmationModal
        visible={Boolean(pendingDeleteMemory)}
        loading={Boolean(deletingId)}
        title="Delete this memory?"
        message="This will permanently remove the memory from your archive."
        onCancel={handleCancelDeleteMemory}
        onConfirm={() => {
          void handleConfirmDeleteMemory();
        }}
      />
    </View>
  );
}
