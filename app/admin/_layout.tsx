import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { fetchCurrentProfile } from "@/lib/profiles";

export default function AdminLayout() {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const profile = await fetchCurrentProfile();

      if (!isMounted) {
        return;
      }

      setIsAuthenticated(Boolean(profile));
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

  if (!isAuthenticated) {
    return <Redirect href="/login?reason=expired" />;
  }

  if (!isAdmin) {
    return <Redirect href="/home" />;
  }

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animationMatchesGesture: true,
          contentStyle: { backgroundColor: "#131313" },
        }}
      />
    </>
  );
}
