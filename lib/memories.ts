import { supabase } from "@/lib/supabase";
import type { Memory } from "@/types/memory";

type SupabaseMemoryRow = {
  id: string;
  user_id: string;
  title: string | null;
  quote: string;
  reflection: string | null;
  image_url: string;
  voice_url: string | null;
  voice_label: string | null;
  voice_duration: string | null;
  tags: string[] | null;
  likes_count: number | null;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
        university: string | null;
        department: string | null;
        avatar_url: string | null;
      }
    | Array<{
        full_name: string | null;
        university: string | null;
        department: string | null;
        avatar_url: string | null;
      }>
    | null;
};

type LikeRow = {
  id: string;
  memory_id: string;
  user_id: string;
};

const MEMORY_MEDIA_BUCKET = "memory-media";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

const MEMORY_SELECT = `
  id,
  user_id,
  title,
  quote,
  reflection,
  image_url,
  voice_url,
  voice_label,
  voice_duration,
  tags,
  likes_count,
  created_at,
  profiles (
    full_name,
    university,
    department,
    avatar_url
  )
`;

function formatLikeCount(value: number) {
  return value.toLocaleString();
}

function fallbackLikeCount(row: SupabaseMemoryRow) {
  return typeof row.likes_count === "number" ? row.likes_count : 0;
}

function stripQueryAndHash(value: string) {
  return value.split("#")[0]?.split("?")[0] ?? value;
}

function normalizeStoragePath(path: string) {
  return stripQueryAndHash(path).replace(/^\/+/, "");
}

function stripBucketPrefix(path: string, bucket: string) {
  const normalized = normalizeStoragePath(path);
  if (normalized.startsWith(`${bucket}/`)) {
    return normalized.slice(bucket.length + 1);
  }

  return normalized;
}

function extractStoragePath(value: string, bucket: string): string | null {
  const source = value.trim();
  if (!source) {
    return null;
  }

  if (!/^https?:\/\//i.test(source)) {
    const normalized = stripBucketPrefix(source, bucket);
    return normalized || null;
  }

  let decoded = source;
  try {
    decoded = decodeURIComponent(source);
  } catch {
    decoded = source;
  }

  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
    `/storage/v1/object/authenticated/${bucket}/`,
  ];

  for (const marker of markers) {
    const index = decoded.indexOf(marker);
    if (index >= 0) {
      const rawPath = decoded.slice(index + marker.length);
      const normalized = stripBucketPrefix(rawPath, bucket);
      return normalized || null;
    }
  }

  return null;
}

async function resolveStorageAssetUrl(
  value: string | null | undefined,
): Promise<string | undefined> {
  if (!value) {
    return undefined;
  }

  const storagePath = extractStoragePath(value, MEMORY_MEDIA_BUCKET);
  if (!storagePath) {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return value;
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl;
  }

  const { data: publicData } = supabase.storage
    .from(MEMORY_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  if (publicData?.publicUrl) {
    return publicData.publicUrl;
  }

  return value;
}

async function fetchLikeState(memoryIds: string[]) {
  const likeCounts = new Map<string, number>();
  const likedMemoryIds = new Set<string>();

  if (memoryIds.length === 0) {
    return { likeCounts, likedMemoryIds };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  const { data, error } = await supabase
    .from("likes")
    .select("memory_id,user_id")
    .in("memory_id", memoryIds);

  if (error || !data) {
    return { likeCounts, likedMemoryIds };
  }

  for (const row of data as Array<Pick<LikeRow, "memory_id" | "user_id">>) {
    likeCounts.set(row.memory_id, (likeCounts.get(row.memory_id) ?? 0) + 1);
    if (currentUserId && row.user_id === currentUserId) {
      likedMemoryIds.add(row.memory_id);
    }
  }

  return { likeCounts, likedMemoryIds };
}

function buildMemoryFromRow(
  row: SupabaseMemoryRow,
  options?: {
    likesCount?: number;
    likedByMe?: boolean;
    resolvedImageUrl?: string;
    resolvedVoiceUrl?: string;
  },
): Memory {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const authorName = profile?.full_name ?? "Anonymous";
  const university = profile?.university ?? "";
  const department = profile?.department ?? "";
  const likesCountValue = options?.likesCount ?? fallbackLikeCount(row);

  return {
    id: row.id,
    authorName,
    authorMeta: department || "Member",
    university,
    imageUri: options?.resolvedImageUrl ?? row.image_url,
    avatarUri:
      profile?.avatar_url ??
      `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(authorName)}`,
    quote: row.quote,
    tags: row.tags ?? [],
    likesCount: formatLikeCount(likesCountValue),
    title: row.title ?? undefined,
    reflection: row.reflection ?? undefined,
    hasVoice: Boolean(row.voice_url),
    voiceUrl: options?.resolvedVoiceUrl ?? row.voice_url ?? undefined,
    voiceLabel: row.voice_label ?? undefined,
    voiceDuration: row.voice_duration ?? undefined,
    likedByMe: options?.likedByMe ?? false,
    createdAt: row.created_at,
  };
}

export async function fetchMemories(): Promise<Memory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Could not load memories from Supabase.");
  }

  const rows = (data ?? []) as unknown as SupabaseMemoryRow[];
  const { likeCounts, likedMemoryIds } = await fetchLikeState(
    rows.map((row) => row.id),
  );
  const resolvedAssets = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      imageUrl: await resolveStorageAssetUrl(row.image_url),
      voiceUrl: await resolveStorageAssetUrl(row.voice_url),
    })),
  );
  const resolvedAssetById = new Map(
    resolvedAssets.map((asset) => [asset.id, asset]),
  );

  return rows.map((row) =>
    buildMemoryFromRow(row, {
      likesCount: likeCounts.get(row.id),
      likedByMe: likedMemoryIds.has(row.id),
      resolvedImageUrl: resolvedAssetById.get(row.id)?.imageUrl,
      resolvedVoiceUrl: resolvedAssetById.get(row.id)?.voiceUrl,
    }),
  );
}

export async function fetchMemoriesByUserId(userId: string): Promise<Memory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      error.message || "Could not load your memories from Supabase.",
    );
  }

  const rows = (data ?? []) as unknown as SupabaseMemoryRow[];
  const { likeCounts, likedMemoryIds } = await fetchLikeState(
    rows.map((row) => row.id),
  );
  const resolvedAssets = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      imageUrl: await resolveStorageAssetUrl(row.image_url),
      voiceUrl: await resolveStorageAssetUrl(row.voice_url),
    })),
  );
  const resolvedAssetById = new Map(
    resolvedAssets.map((asset) => [asset.id, asset]),
  );

  return rows.map((row) =>
    buildMemoryFromRow(row, {
      likesCount: likeCounts.get(row.id),
      likedByMe: likedMemoryIds.has(row.id),
      resolvedImageUrl: resolvedAssetById.get(row.id)?.imageUrl,
      resolvedVoiceUrl: resolvedAssetById.get(row.id)?.voiceUrl,
    }),
  );
}

export async function fetchMemoryById(id: string): Promise<Memory | undefined> {
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") {
      return undefined;
    }

    throw new Error(error.message || "Could not load the selected memory.");
  }

  if (!data) {
    return undefined;
  }

  const row = data as unknown as SupabaseMemoryRow;
  const { likeCounts, likedMemoryIds } = await fetchLikeState([row.id]);
  const [resolvedImageUrl, resolvedVoiceUrl] = await Promise.all([
    resolveStorageAssetUrl(row.image_url),
    resolveStorageAssetUrl(row.voice_url),
  ]);

  return buildMemoryFromRow(row, {
    likesCount: likeCounts.get(row.id),
    likedByMe: likedMemoryIds.has(row.id),
    resolvedImageUrl,
    resolvedVoiceUrl,
  });
}

async function requireSignedInUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please sign in to like memories.");
  }

  return user.id;
}

export async function toggleMemoryLike(
  memoryId: string,
): Promise<{ liked: boolean; likesCount: string }> {
  const userId = await requireSignedInUserId();

  const { data: existingLike, error: existingLikeError } = await supabase
    .from("likes")
    .select("id,memory_id,user_id")
    .eq("memory_id", memoryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingLikeError && existingLikeError.code !== "PGRST116") {
    throw new Error(existingLikeError.message || "Could not read like state.");
  }

  let liked = false;

  if (existingLike) {
    const { error: unlikeError } = await supabase
      .from("likes")
      .delete()
      .eq("id", existingLike.id);

    if (unlikeError) {
      throw new Error(unlikeError.message || "Could not remove like.");
    }

    liked = false;
  } else {
    const { error: likeError } = await supabase
      .from("likes")
      .insert({ memory_id: memoryId, user_id: userId });

    if (likeError) {
      throw new Error(likeError.message || "Could not save like.");
    }

    liked = true;
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("id", { head: true, count: "exact" })
    .eq("memory_id", memoryId);

  if (countError) {
    throw new Error(countError.message || "Could not refresh likes count.");
  }

  return {
    liked,
    likesCount: formatLikeCount(count ?? 0),
  };
}
