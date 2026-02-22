"use client";

import { useCallback, useMemo, useState } from "react";
import {
  createEmptyEducation,
  createEmptyExperience,
  type EducationEntry,
  type ExperienceEntry,
  type ResumeData,
} from "@/types/resume";

export interface ResumeValidationErrors {
  fullName?: string;
  email?: string;
  location?: string;
  phone?: string;
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
}

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
  getValidationErrors: (data: ResumeData) => ResumeValidationErrors | null;
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
    const hasSkills = data.skills.length > 0;
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
      hasSkills &&
      hasValidExperience &&
      hasValidEducation
    );
  }, [data]);

  const getValidationErrors = useCallback(
    (formData: ResumeData): ResumeValidationErrors | null => {
      const errors: ResumeValidationErrors = {};

      if (formData.fullName.trim() === "") {
        errors.fullName = "Nome completo é obrigatório";
      }
      if (formData.email.trim() === "") {
        errors.email = "E-mail é obrigatório";
      }
      if (formData.location.trim() === "") {
        errors.location = "Local é obrigatório";
      }
      if (formData.phone.trim() === "") {
        errors.phone = "Telefone é obrigatório";
      }
      if (formData.summary.trim() === "") {
        errors.summary = "Resumo profissional é obrigatório";
      }
      if (formData.skills.length === 0) {
        errors.skills = "Adicione pelo menos uma habilidade";
      }
      const hasValidExperience = formData.experience.some(
        (exp) => exp.company.trim() !== "" && exp.jobTitle.trim() !== ""
      );
      if (!hasValidExperience) {
        errors.experience =
          "Preencha pelo menos uma experiência com empresa e cargo";
      }
      const hasValidEducation = formData.education.some(
        (edu) =>
          edu.institution.trim() !== "" &&
          edu.course.trim() !== "" &&
          edu.level.trim() !== ""
      );
      if (!hasValidEducation) {
        errors.education =
          "Preencha pelo menos uma formação com instituição, curso e nível";
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
    []
  );

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
    getValidationErrors,
  };
}
