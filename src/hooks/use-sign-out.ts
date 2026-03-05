"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { clearResumeStatusCookie } from "@/app/actions/resume";
import { ROUTE_LOGIN } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/utils/auth";
import { useToastNotification } from "@/hooks/useToastNotification";

export interface UseSignOutReturn {
  signOut: () => Promise<void>;
  isPending: boolean;
}

export function useSignOut(): UseSignOutReturn {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { showErrorToastNotification } = useToastNotification();

  async function signOut() {
    setIsPending(true);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        const message = translateAuthError(signOutError);
        console.error("[useSignOut] sign out error:", signOutError.message);
        showErrorToastNotification(message);
        return;
      }

      router.replace(ROUTE_LOGIN);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao sair. Tente novamente.";
      console.error("[useSignOut] unexpected error:", err);
      showErrorToastNotification(message);
    } finally {
      setIsPending(false);
      clearResumeStatusCookie();
    }
  }

  return { signOut, isPending };
}
