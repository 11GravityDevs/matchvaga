"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { saveResumeData } from "@/app/actions/resume";
import { ROUTE_DASHBOARD } from "@/constants/routes";
import type { ResumeData } from "@/types/resume";
import { useOnboardingContext } from "../../_contexts/onboarding-context";

export interface UseResumeVerifyReturn {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  isSaving: boolean;
  save: (data: ResumeData) => Promise<void>;
  continueToDashboard: () => void;
}

export function useResumeVerify(): UseResumeVerifyReturn {
  const router = useRouter();
  const { resumeContent, setResumeContent, resumeId } = useOnboardingContext();
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (data: ResumeData) => {
      if (!resumeId) {
        throw new Error(
          "Resumo não encontrado. Volte e envie o arquivo novamente."
        );
      }

      setIsSaving(true);
      try {
        const result = await saveResumeData(resumeId, data);
        if (!result.success) {
          throw new Error(result.error ?? "Erro ao salvar.");
        }
      } finally {
        setIsSaving(false);
      }
    },
    [resumeId]
  );

  const continueToDashboard = useCallback(() => {
    router.push(ROUTE_DASHBOARD);
  }, [router]);

  return {
    resumeContent,
    setResumeContent,
    isSaving,
    save,
    continueToDashboard,
  };
}
