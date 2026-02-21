"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type LoginStep = "email" | "token";

const VALID_STEPS: readonly LoginStep[] = ["email", "token"] as const;

function parseLoginStepFromSearchParams(
  searchParams: URLSearchParams
): LoginStep {
  const step = searchParams.get("step");
  if (step === "email" || step === "token") {
    return step;
  }

  return "email";
}

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
  submitEmail: (email: string, rememberMe?: boolean) => Promise<void>;
  submitToken: (token: string) => Promise<void>;
  resendToken: () => Promise<void>;
}

export function useLogin(): UseLoginReturn {
  const { step, setStep, isPending } = useLoginStep();
  const router = useRouter();

  const submitEmail = useCallback(
    async (_email: string, _rememberMe?: boolean) => {
      // TODO: Call API to send magic link / OTP
      // For now, just advance to token step
      setStep("token");
    },
    [setStep]
  );

  const submitToken = useCallback(
    async (_token: string) => {
      // TODO: Call API to verify token
      // For now, redirect to dashboard
      router.push("/onboarding/upload");
    },
    [router]
  );

  const resendToken = useCallback(async () => {
    // TODO: Call API to resend OTP
  }, []);

  return {
    step,
    setStep,
    isPending,
    submitEmail,
    submitToken,
    resendToken,
  };
}
