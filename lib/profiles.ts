import { supabase } from "@/lib/supabase";

const PROFILE_MEDIA_BUCKET = "memory-media";

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

async function resolveAvatarUrl(avatarValue: string | null) {
  if (!avatarValue) {
    return null;
  }

  if (isHttpUrl(avatarValue)) {
    return avatarValue;
  }

  const { data, error } = await supabase.storage
    .from(PROFILE_MEDIA_BUCKET)
    .createSignedUrl(avatarValue, 60 * 60 * 24 * 7);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export type Profile = {
  id: string;
  full_name: string | null;
  university: string | null;
  department: string | null;
  graduation_year: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

export async function fetchCurrentProfileRole(): Promise<{
  is_admin: boolean;
} | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as { is_admin: boolean };
}

export async function fetchCurrentProfile(): Promise<Profile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, university, department, graduation_year, avatar_url, is_admin",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const typedData = data as Profile;
  const resolvedAvatarUrl = await resolveAvatarUrl(typedData.avatar_url);

  return {
    ...typedData,
    avatar_url: resolvedAvatarUrl,
  };
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}
