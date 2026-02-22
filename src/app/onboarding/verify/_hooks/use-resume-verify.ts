"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { ROUTE_DASHBOARD } from "@/constants/routes";
import { useOnboardingContext } from "../../_contexts/onboarding-context";

export interface UseResumeVerifyReturn {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  isSaving: boolean;
  save: () => Promise<void>;
  continueToDashboard: () => void;
}

export function useResumeVerify(): UseResumeVerifyReturn {
  const router = useRouter();
  const { resumeContent, setResumeContent } = useOnboardingContext();

  const save = useCallback(async () => {
    // TODO: Call API to save resume
    // For now, no-op
  }, []);

  const continueToDashboard = useCallback(() => {
    router.push(ROUTE_DASHBOARD);
  }, [router]);

  return {
    resumeContent,
    setResumeContent,
    isSaving: false,
    save,
    continueToDashboard,
  };
}
