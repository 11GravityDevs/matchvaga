"use client";

import { useCallback, useState } from "react";
import { useResumeVerify } from "../_hooks/use-resume-verify";
import {
  useResumeForm,
  type ResumeValidationErrors,
} from "@/hooks/use-resume-form";
import type { ResumeData } from "@/types/resume";
import { createEmptyEducation, createEmptyExperience } from "@/types/resume";
import { ResumeFormCard } from "@/components/shared/resume-form-card";
import { useOnboardingContext } from "../../_contexts/onboarding-context";

export function VerifyContent() {
  const { resumeContent, setResumeContent, parsedData } =
    useOnboardingContext();
  const { isSaving, save, continueToDashboard } = useResumeVerify();
  const [validationErrors, setValidationErrors] =
    useState<ResumeValidationErrors | null>(null);

  const initialData: ResumeData = parsedData ?? {
    fullName: "",
    email: "",
    location: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: resumeContent,
    skills: [],
    experience: [createEmptyExperience()],
    education: [createEmptyEducation()],
  };

  const {
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
  } = useResumeForm({
    initialData,
    onSummarySync: setResumeContent,
  });

  const clearValidationOnChange = useCallback(() => {
    setValidationErrors(null);
  }, []);

  const wrappedUpdateField = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
      clearValidationOnChange();
      updateField(key, value);
    },
    [clearValidationOnChange, updateField]
  );

  const wrappedHandleSummaryChange = useCallback(
    (value: string) => {
      clearValidationOnChange();
      handleSummaryChange(value);
    },
    [clearValidationOnChange, handleSummaryChange]
  );

  const wrappedUpdateExperience = useCallback(
    (index: number, updates: Parameters<typeof updateExperience>[1]) => {
      clearValidationOnChange();
      updateExperience(index, updates);
    },
    [clearValidationOnChange, updateExperience]
  );

  const wrappedAddExperience = useCallback(() => {
    clearValidationOnChange();
    addExperience();
  }, [clearValidationOnChange, addExperience]);

  const wrappedRemoveExperience = useCallback(
    (index: number) => {
      clearValidationOnChange();
      removeExperience(index);
    },
    [clearValidationOnChange, removeExperience]
  );

  const wrappedUpdateEducation = useCallback(
    (index: number, updates: Parameters<typeof updateEducation>[1]) => {
      clearValidationOnChange();
      updateEducation(index, updates);
    },
    [clearValidationOnChange, updateEducation]
  );

  const wrappedAddEducation = useCallback(() => {
    clearValidationOnChange();
    addEducation();
  }, [clearValidationOnChange, addEducation]);

  const wrappedRemoveEducation = useCallback(
    (index: number) => {
      clearValidationOnChange();
      removeEducation(index);
    },
    [clearValidationOnChange, removeEducation]
  );

  const handleContinue = useCallback(async () => {
    if (!isFormValid) {
      setValidationErrors(getValidationErrors(data) ?? null);
      return;
    }
    setValidationErrors(null);
    try {
      await save(data);
      continueToDashboard();
    } catch (err) {
      setValidationErrors({
        form: err instanceof Error ? err.message : "Erro ao salvar.",
      });
    }
  }, [data, isFormValid, getValidationErrors, save, continueToDashboard]);

  return (
    <ResumeFormCard
      data={data}
      updateField={wrappedUpdateField}
      updateExperience={wrappedUpdateExperience}
      addExperience={wrappedAddExperience}
      removeExperience={wrappedRemoveExperience}
      updateEducation={wrappedUpdateEducation}
      addEducation={wrappedAddEducation}
      removeEducation={wrappedRemoveEducation}
      handleSummaryChange={wrappedHandleSummaryChange}
      isSaving={isSaving}
      primaryAction={{
        label: "Continuar",
        onClick: handleContinue,
        disabled: isSaving,
        loading: isSaving,
      }}
      validationErrors={validationErrors}
    />
  );
}
