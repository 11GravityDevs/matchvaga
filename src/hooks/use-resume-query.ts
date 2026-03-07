"use client";

import { useQuery } from "@tanstack/react-query";

import {
  createEmptyEducation,
  createEmptyExperience,
  type ResumeData,
} from "@/types/resume";
import { resumeQueryOptions } from "@/lib/query/query-options";

export const EMPTY_RESUME_DATA: ResumeData = {
  fullName: "",
  email: "",
  location: "",
  phone: "",
  linkedin: "",
  github: "",
  summary: "",
  hardSkills: [],
  softSkills: [],
  languages: [],
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
};

export interface UseResumeQueryReturn {
  resumeId: string | null;
  resumeData: ResumeData;
  hasNoResume: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

export function useResumeQuery(): UseResumeQueryReturn {
  const { data, isLoading, error, refetch } = useQuery(resumeQueryOptions);

  const hasNoResume = !data?.resumeId || !data?.data;
  const resumeId = data?.resumeId ?? null;
  const resumeData = data?.data ?? EMPTY_RESUME_DATA;

  return {
    resumeId,
    resumeData,
    hasNoResume,
    isLoading,
    error:
      error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}
