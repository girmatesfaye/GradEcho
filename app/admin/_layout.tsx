import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

import { fetchCurrentProfile } from "@/lib/profiles";

export default function AdminLayout() {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const profile = await fetchCurrentProfile();

      if (!isMounted) {
        return;
      }

      setIsAdmin(profile?.is_admin ?? false);
      setReady(true);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!ready) {
    return null;
  }

  if (!isAdmin) {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
