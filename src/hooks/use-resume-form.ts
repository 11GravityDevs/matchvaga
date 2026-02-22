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
  form?: string;
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
      } else {
        const experiencesWithoutEndDate = formData.experience.filter(
          (exp) => !exp.endDate?.trim()
        );
        const currentExperiences = formData.experience.filter(
          (exp) => exp.isCurrent === true
        );
        if (experiencesWithoutEndDate.length > 1) {
          errors.experience =
            "Apenas uma experiência pode estar em andamento (sem data de término). Preencha a data de término das demais.";
        } else if (
          experiencesWithoutEndDate.some((exp) => exp.isCurrent !== true)
        ) {
          errors.experience =
            "Preencha a data de término ou marque como experiência atual.";
        } else if (currentExperiences.length > 1) {
          errors.experience =
            "Apenas uma experiência pode ser marcada como atual.";
        }
      }

      const educationsWithoutCompletionDate = formData.education.filter(
        (edu) => !edu.completionDate?.trim()
      );
      const currentEducations = formData.education.filter(
        (edu) => edu.isCurrent === true
      );
      if (educationsWithoutCompletionDate.length > 1) {
        errors.education =
          "Apenas uma formação pode estar em andamento (sem data de conclusão). Preencha a data de conclusão das demais.";
      } else if (
        educationsWithoutCompletionDate.some((edu) => edu.isCurrent !== true)
      ) {
        errors.education =
          "Preencha a data de conclusão ou marque como formação atual.";
      } else if (currentEducations.length > 1) {
        errors.education = "Apenas uma formação pode ser marcada como atual.";
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
    []
  );

  const isFormValid = useMemo(
    () => getValidationErrors(data) === null,
    [data, getValidationErrors]
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
