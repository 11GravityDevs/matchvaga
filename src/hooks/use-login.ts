"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/utils/auth";
import { parseLoginStepFromSearchParams, type LoginStep } from "@/utils/url";

export type { LoginStep };

const VALID_STEPS: readonly LoginStep[] = ["email", "magic-link"] as const;
export const LOGIN_EMAIL_STORAGE_KEY = "login-email";

export function useLoginStep(): {
  step: LoginStep;
  setStep: (step: LoginStep) => void;
  isPending: boolean;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const step = parseLoginStepFromSearchParams(searchParams);

  const setStep = useCallback(
    (newStep: LoginStep) => {
      if (!VALID_STEPS.includes(newStep)) return;

      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("step", newStep);
        router.push(`/login?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  return { step, setStep, isPending };
}

export interface UseLoginReturn {
  step: LoginStep;
  setStep: (step: LoginStep) => void;
  isPending: boolean;
  email: string | null;
  submitEmail: (email: string, rememberMe?: boolean) => Promise<void>;
  resendLink: () => Promise<void>;
  submitGoogle: () => Promise<void>;
}

export function useLogin(): UseLoginReturn {
  const { step, setStep, isPending } = useLoginStep();
  const supabase = createClient();

  const submitEmail = useCallback(
    async (email: string) => {
      const trimmedEmail = email.trim();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/upload`,
        },
      });

      if (error) {
        throw new Error(translateAuthError(error));
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(LOGIN_EMAIL_STORAGE_KEY, trimmedEmail);
      }
      setStep("magic-link");
    },
    [setStep, supabase.auth]
  );

  const resendLink = useCallback(async () => {
    const email =
      typeof window !== "undefined"
        ? sessionStorage.getItem(LOGIN_EMAIL_STORAGE_KEY)
        : null;

    if (!email) {
      throw new Error("Sessão expirada. Volte e insira seu email novamente.");
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/upload`,
      },
    });

    if (error) {
      throw new Error(translateAuthError(error));
    }
  }, [supabase.auth]);

  const submitGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding/upload`,
      },
    });

    if (error) {
      throw new Error(translateAuthError(error));
    }
  }, [supabase.auth]);

  const email =
    step === "magic-link" && typeof window !== "undefined"
      ? sessionStorage.getItem(LOGIN_EMAIL_STORAGE_KEY)
      : null;

  return {
    step,
    setStep,
    isPending,
    email,
    submitEmail,
    resendLink,
    submitGoogle,
  };
}
