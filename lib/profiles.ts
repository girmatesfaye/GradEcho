import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  full_name: string | null;
  university: string | null;
  department: string | null;
  graduation_year: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

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

  return data as Profile;
}
