"use client";

import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { identifyUser, resetUser, trackEvent } from "@/lib/analytics/posthog";
import {
  clearPosthogLoginMethod,
  getPosthogLoginMethod,
} from "@/lib/analytics/posthog-login-method";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const previousHadSessionRef = useRef(false);

  useEffect(() => {
    const supabaseClient = createClient();
    let isMounted = true;

    void supabaseClient.auth.getSession().then(({ data: { session: s } }) => {
      if (!isMounted) return;
      setSession(s);
      previousHadSessionRef.current = Boolean(s);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, s) => {
      if (!isMounted) return;

      const hadSession = previousHadSessionRef.current;

      if (s?.user) {
        identifyUser(s.user.id, {
          email: s.user.email ?? undefined,
          name:
            (s.user.user_metadata?.full_name as string | undefined) ??
            (s.user.user_metadata?.name as string | undefined),
        });

        if (!hadSession) {
          const method = getPosthogLoginMethod();
          if (method) {
            trackEvent("auth_login_succeeded", { method });
            clearPosthogLoginMethod();
          }
          previousHadSessionRef.current = true;
        }
      } else {
        resetUser();
        previousHadSessionRef.current = false;
      }

      setSession(s);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: Boolean(session) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
