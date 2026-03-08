"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createEmptyEducation,
  createEmptyExperience,
  type EducationEntry,
  type ExperienceEntry,
  type ResumeData,
} from "@/types/resume";

export type {
  EducationEntryFieldErrors,
  ExperienceEntryFieldErrors,
  ResumeValidationErrors,
} from "@/types/resume";

export interface UseResumeFormOptions {
  initialData: ResumeData;
  onSummarySync?: (value: string) => void;
}

export interface UseResumeFormReturn {
  data: ResumeData;
  isDirty: boolean;
  reset: () => void;
  updateField: <K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) => void;
  updateExperience: (index: number, updates: Partial<ExperienceEntry>) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  updateEducation: (index: number, updates: Partial<EducationEntry>) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
  handleSummaryChange: (value: string) => void;
}

function resumeDataEquals(a: ResumeData, b: ResumeData): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useResumeForm({
  initialData,
  onSummarySync,
}: UseResumeFormOptions): UseResumeFormReturn {
  const [data, setData] = useState<ResumeData>(initialData);
  const initialDataRef = useRef<ResumeData>(initialData);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const reset = useCallback(() => {
    setData(initialDataRef.current);
  }, []);

  function updateField<K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateExperience(index: number, updates: Partial<ExperienceEntry>) {
    setData((prev) => {
      const isSettingCurrent = updates.isCurrent === true;
      return {
        ...prev,
        experience: prev.experience.map((exp, i) => {
          if (i === index) {
            return { ...exp, ...updates };
          }
          if (isSettingCurrent) {
            return { ...exp, isCurrent: false };
          }
          return exp;
        }),
      };
    });
  }

  function addExperience() {
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, createEmptyExperience()],
    }));
  }

  function removeExperience(index: number) {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function updateEducation(index: number, updates: Partial<EducationEntry>) {
    setData((prev) => {
      const isSettingCurrent = updates.isCurrent === true;
      return {
        ...prev,
        education: prev.education.map((edu, i) => {
          if (i === index) {
            return { ...edu, ...updates };
          }
          if (isSettingCurrent) {
            return { ...edu, isCurrent: false };
          }
          return edu;
        }),
      };
    });
  }

  function addEducation() {
    setData((prev) => ({
      ...prev,
      education: [...prev.education, createEmptyEducation()],
    }));
  }

  function removeEducation(index: number) {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function handleSummaryChange(value: string) {
    updateField("summary", value);
    onSummarySync?.(value);
  }

  const isDirty = useMemo(
    () => !resumeDataEquals(data, initialData),
    [data, initialData]
  );

  return {
    data,
    isDirty,
    reset,
    updateField,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    handleSummaryChange,
  };
}
