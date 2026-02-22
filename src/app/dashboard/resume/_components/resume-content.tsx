"use client";

import { useCallback, useState } from "react";
import { useResume } from "../_hooks/use-resume";
import {
  useResumeForm,
  type ResumeValidationErrors,
} from "@/hooks/use-resume-form";
import { ResumeFormCard } from "@/components/shared/resume-form-card";
import {
  PAGE_PADDING,
  PAGE_SUBTITLE_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_GAP,
  W_CONTENT,
} from "@/constants/design-tokens";
import { W_FORM } from "@/constants/design-tokens";
import type { ResumeData } from "@/types/resume";

export function ResumeContent() {
  const { resumeData, save, isSaving, error } = useResume();
  const [validationErrors, setValidationErrors] =
    useState<ResumeValidationErrors | null>(null);

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
    initialData: resumeData,
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

  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      setValidationErrors(getValidationErrors(data) ?? null);
      return;
    }
    setValidationErrors(null);
    try {
      await save(data);
    } catch {
      // Error is set in useResume and displayed below
    }
  }, [data, isFormValid, getValidationErrors, save]);

  return (
    <div
      className={`flex w-full flex-col items-center overflow-auto ${SECTION_GAP} ${PAGE_PADDING}`}
    >
      {error && (
        <div
          role="alert"
          className={`rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive ${W_FORM}`}
        >
          Falha ao salvar. Tente novamente.
        </div>
      )}
      <div className={`flex flex-col gap-1 ${W_CONTENT}`}>
        <h1 className={PAGE_TITLE_CLASS}>Edite seu currículo</h1>
        <p className={PAGE_SUBTITLE_CLASS}>
          Atualize suas informações e salve as alterações.
        </p>
      </div>
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
          label: "Salvar",
          onClick: handleSave,
          disabled: isSaving,
          loading: isSaving,
        }}
        hideHeader
        validationErrors={validationErrors}
      />
    </div>
  );
}
