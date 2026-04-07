import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setIsAuthenticated(Boolean(data.session));
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return null;
  }

  return <Redirect href={isAuthenticated ? "/home" : "/capture"} />;
}
