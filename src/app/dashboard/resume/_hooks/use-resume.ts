"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createEmptyEducation,
  createEmptyExperience,
  type ResumeData,
} from "@/types/resume";
import { getResumeForUser, saveResumeData } from "@/app/actions/resume";

const EMPTY_RESUME_DATA: ResumeData = {
  fullName: "",
  email: "",
  location: "",
  phone: "",
  linkedin: "",
  github: "",
  summary: "",
  skills: [],
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
};

export interface UseResumeReturn {
  resumeData: ResumeData;
  resumeId: string | null;
  isLoading: boolean;
  error: Error | null;
  hasNoResume: boolean;
  save: (data: ResumeData) => Promise<void>;
  isSaving: boolean;
}

export function useResume(): UseResumeReturn {
  const [resumeData, setResumeData] = useState<ResumeData>(EMPTY_RESUME_DATA);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNoResume, setHasNoResume] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchResume() {
      const result = await getResumeForUser();

      if (cancelled) return;

      if (!result.success) {
        setError(new Error(result.error ?? "Erro ao carregar currículo."));
        setIsLoading(false);
        return;
      }

      if (!result.resumeId || !result.data) {
        setHasNoResume(true);
        setResumeData(EMPTY_RESUME_DATA);
      } else {
        setResumeId(result.resumeId);
        setResumeData(result.data);
      }
      setIsLoading(false);
    }

    fetchResume();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (data: ResumeData) => {
      if (!resumeId) {
        setError(
          new Error("Nenhum currículo encontrado. Faça o upload primeiro.")
        );
        return;
      }

      setError(null);
      setIsSaving(true);
      try {
        const result = await saveResumeData(resumeId, data);
        if (!result.success) {
          throw new Error(result.error ?? "Falha ao salvar");
        }
        setResumeData(data);
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Falha ao salvar");
        setError(err);
        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [resumeId]
  );

  return {
    resumeData,
    resumeId,
    isLoading,
    error,
    hasNoResume,
    save,
    isSaving,
  };
}
