"use client";

import { useCallback, useState } from "react";
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

interface ResumeEditFormProps {
  initialData: ResumeData;
  save: (data: ResumeData) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

function ResumeEditForm({
  initialData,
  save,
  isSaving,
  error,
}: ResumeEditFormProps) {
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
  } = useResumeForm({ initialData });

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
    <div className="flex w-full flex-col items-center section-gap overflow-auto page-padding">
      {error && (
        <div
          role="alert"
          className="w-form rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Falha ao salvar. Tente novamente.
        </div>
      )}
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

  if (hasNoResume) {
    return (
      <main className="flex w-full flex-col items-center section-gap overflow-auto page-padding">
        <div className="flex w-content flex-col gap-1">
          <h1 className="text-page-title">Nenhum currículo encontrado</h1>
          <p className="text-page-subtitle">
            Faça o upload do seu currículo para começar a editá-lo.
          </p>
          <Link
            href={ROUTE_ONBOARDING_UPLOAD}
            className="text-primary underline hover:no-underline"
          >
            Ir para upload
          </Link>
        </div>
      </main>
    );
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
