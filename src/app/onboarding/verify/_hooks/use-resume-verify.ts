"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { saveResumeData } from "@/app/actions/resume";
import {
  QUERY_KEY_CURRENT_USER_DISPLAY,
  QUERY_KEY_RESUME,
} from "@/constants/query-keys";
import { ROUTE_DASHBOARD } from "@/constants/routes";
import type { ResumeData } from "@/types/resume";
import { useOnboardingContext } from "../../_contexts/onboarding-context";

export interface UseResumeVerifyOptions {
  resumeId: string | null;
}

export interface UseResumeVerifyReturn {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  isSaving: boolean;
  save: (data: ResumeData) => Promise<void>;
  continueToDashboard: () => void;
}

export function useResumeVerify({
  resumeId,
}: UseResumeVerifyOptions): UseResumeVerifyReturn {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { resumeContent, setResumeContent } = useOnboardingContext();

  const { mutateAsync: saveMutation, isPending: isSaving } = useMutation({
    mutationFn: async (data: ResumeData) => {
      if (!resumeId) {
        throw new Error(
          "Resumo não encontrado. Volte e envie o arquivo novamente."
        );
      }

      const result = await saveResumeData(resumeId, data);
      if (!result.success) {
        throw new Error(result.error ?? "Erro ao salvar.");
      }

      return { resumeId, data };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(QUERY_KEY_RESUME, {
        success: true,
        resumeId: result.resumeId,
        data: result.data,
      });

      queryClient.setQueryData(QUERY_KEY_CURRENT_USER_DISPLAY, {
        success: true,
        fullName: result.data.fullName,
        email: result.data.email,
      });
    },
  });

  async function save(data: ResumeData) {
    await saveMutation(data);
  }

  function continueToDashboard() {
    router.push(`${ROUTE_DASHBOARD}?from=onboarding`);
  }

  return {
    resumeContent,
    setResumeContent,
    isSaving,
    save,
    continueToDashboard,
  };
}
