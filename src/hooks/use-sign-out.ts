"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { ROUTE_LOGIN } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/utils/auth";

export interface UseSignOutReturn {
  signOut: () => Promise<void>;
  isPending: boolean;
  error: string | null;
}

export function useSignOut(): UseSignOutReturn {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    setIsPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        const message = translateAuthError(signOutError);
        setError(message);
        console.error("[useSignOut] sign out error:", signOutError.message);
        return;
      }

      router.replace(ROUTE_LOGIN);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao sair. Tente novamente.";
      setError(message);
      console.error("[useSignOut] unexpected error:", err);
    } finally {
      setIsPending(false);
    }
  }, [router]);

  return { signOut, isPending, error };
}
