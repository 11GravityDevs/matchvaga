"use client";

import { useCallback, useMemo, useState } from "react";
import {
  createEmptyEducation,
  createEmptyExperience,
  type EducationEntry,
  type ExperienceEntry,
  type ResumeData,
} from "@/types/resume";

export interface UseResumeFormOptions {
  initialData: ResumeData;
  onSummarySync?: (value: string) => void;
}

export interface UseResumeFormReturn {
  data: ResumeData;
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
  isFormValid: boolean;
}

export function useResumeForm({
  initialData,
  onSummarySync,
}: UseResumeFormOptions): UseResumeFormReturn {
  const [data, setData] = useState<ResumeData>(initialData);

  const updateField = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateExperience = useCallback(
    (index: number, updates: Partial<ExperienceEntry>) => {
      setData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp, i) =>
          i === index ? { ...exp, ...updates } : exp
        ),
      }));
    },
    []
  );

  const addExperience = useCallback(() => {
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, createEmptyExperience()],
    }));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);

  const updateEducation = useCallback(
    (index: number, updates: Partial<EducationEntry>) => {
      setData((prev) => ({
        ...prev,
        education: prev.education.map((edu, i) =>
          i === index ? { ...edu, ...updates } : edu
        ),
      }));
    },
    []
  );

  const addEducation = useCallback(() => {
    setData((prev) => ({
      ...prev,
      education: [...prev.education, createEmptyEducation()],
    }));
  }, []);

  const removeEducation = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSummaryChange = useCallback(
    (value: string) => {
      updateField("summary", value);
      onSummarySync?.(value);
    },
    [updateField, onSummarySync]
  );

  const isFormValid = useMemo(() => {
    const hasRequiredPersonalData =
      data.fullName.trim() !== "" &&
      data.email.trim() !== "" &&
      data.location.trim() !== "" &&
      data.phone.trim() !== "";
    const hasSummary = data.summary.trim() !== "";
    const hasValidExperience = data.experience.some(
      (exp) => exp.company.trim() !== "" && exp.jobTitle.trim() !== ""
    );
    const hasValidEducation = data.education.some(
      (edu) =>
        edu.institution.trim() !== "" &&
        edu.course.trim() !== "" &&
        edu.level.trim() !== ""
    );
    return (
      hasRequiredPersonalData &&
      hasSummary &&
      hasValidExperience &&
      hasValidEducation
    );
  }, [data]);

  return {
    data,
    updateField,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    handleSummaryChange,
    isFormValid,
  };
}
