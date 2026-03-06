"use client";

import { useState } from "react";
import Link from "next/link";
import { useResume } from "../_hooks/use-resume";
import {
  useResumeForm,
  type ResumeValidationErrors,
} from "@/hooks/use-resume-form";
import { ResumeFormCard } from "@/components/shared/resume-form-card";
import { Loading } from "@/components/ui/loading";
import { ROUTE_ONBOARDING_UPLOAD } from "@/constants/routes";
import type { ResumeData } from "@/types/resume";
import { useToastNotification } from "@/hooks/useToastNotification";
import { getResumeValidationErrors } from "@/utils/resume-validation";

interface ResumeEditFormProps {
  initialData: ResumeData;
  save: (data: ResumeData) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

function ResumeEditForm({ initialData, save, isSaving }: ResumeEditFormProps) {
  const [validationErrors, setValidationErrors] =
    useState<ResumeValidationErrors | null>(null);
  const { showErrorToastNotification } = useToastNotification();

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
  } = useResumeForm({ initialData });

  function clearValidationOnChange() {
    setValidationErrors(null);
  }

  function wrappedUpdateField<K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) {
    clearValidationOnChange();
    updateField(key, value);
  }

  function wrappedHandleSummaryChange(value: string) {
    clearValidationOnChange();
    handleSummaryChange(value);
  }

  function wrappedUpdateExperience(
    index: number,
    updates: Parameters<typeof updateExperience>[1]
  ) {
    clearValidationOnChange();
    updateExperience(index, updates);
  }

  function wrappedAddExperience() {
    clearValidationOnChange();
    addExperience();
  }

  function wrappedRemoveExperience(index: number) {
    clearValidationOnChange();
    removeExperience(index);
  }

  function wrappedUpdateEducation(
    index: number,
    updates: Parameters<typeof updateEducation>[1]
  ) {
    clearValidationOnChange();
    updateEducation(index, updates);
  }

  function wrappedAddEducation() {
    clearValidationOnChange();
    addEducation();
  }

  function wrappedRemoveEducation(index: number) {
    clearValidationOnChange();
    removeEducation(index);
  }

  async function handleSave() {
    const errors = getResumeValidationErrors(data);

    if (errors !== null) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors(null);
    try {
      await save(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao salvar. Tente novamente.";
      showErrorToastNotification(message);
    }
  }

  return (
    <div className="flex w-full flex-col items-center section-gap overflow-auto page-padding">
      <div className="flex w-content flex-col gap-1">
        <h1 className="text-page-title">Edite seu currículo</h1>
        <p className="text-page-subtitle">
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

export function ResumeContent() {
  const { resumeData, isLoading, error, hasNoResume, save, isSaving } =
    useResume();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ResumeEditForm
      initialData={resumeData}
      save={save}
      isSaving={isSaving}
      error={error}
    />
  );
}
