"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ResumeData } from "@/types/resume";
import { saveResumeData } from "@/app/actions/resume";
import { QUERY_KEY_RESUME } from "@/constants/query-keys";
import {
  useResumeQuery,
  type UseResumeQueryReturn,
} from "@/hooks/use-resume-query";

export interface UseResumeReturn extends UseResumeQueryReturn {
  save: (data: ResumeData) => Promise<void>;
  isSaving: boolean;
}

export function useResume(): UseResumeReturn {
  const queryClient = useQueryClient();
  const { resumeId, resumeData, hasNoResume, isLoading, error, refetch } =
    useResumeQuery();

  const {
    mutateAsync: saveMutation,
    isPending: isSaving,
    error: mutationError,
  } = useMutation({
    mutationFn: async (data: ResumeData) => {
      if (!resumeId) {
        throw new Error("Nenhum currículo encontrado. Faça o upload primeiro.");
      }

      const result = await saveResumeData(resumeId, data);
      if (!result.success) {
        throw new Error(result.error ?? "Falha ao salvar");
      }

      queryClient.setQueryData(QUERY_KEY_RESUME, {
        success: true,
        resumeId,
        data,
      });
    },
  });

  const save = useCallback(
    async (data: ResumeData) => {
      await saveMutation(data);
    },
    [saveMutation]
  );

  const displayError = mutationError instanceof Error ? mutationError : error;

  return {
    resumeId,
    resumeData,
    hasNoResume,
    isLoading,
    error: displayError,
    refetch,
    save,
    isSaving,
  };
}
