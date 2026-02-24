"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

import { FileQuestion, Upload } from "lucide-react";

import { useResumeVerify } from "../_hooks/use-resume-verify";
import {
  useResumeForm,
  type ResumeValidationErrors,
} from "@/hooks/use-resume-form";
import { useResumeQuery } from "@/hooks/use-resume-query";
import type { ResumeData } from "@/types/resume";
import { createEmptyEducation, createEmptyExperience } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { ResumeFormCard } from "@/components/shared/resume-form-card";
import { Loading } from "@/components/ui/loading";
import { ROUTE_ONBOARDING_UPLOAD } from "@/constants/routes";
import { useOnboardingContext } from "../../_contexts/onboarding-context";

export function VerifyContent() {
  const {
    resumeContent,
    setResumeContent,
    parsedData,
    resumeId: contextResumeId,
  } = useOnboardingContext();
  const {
    resumeId: queryResumeId,
    resumeData: queryResumeData,
    hasNoResume,
    isLoading: isLoadingResume,
  } = useResumeQuery();

  const effectiveResumeId = contextResumeId ?? queryResumeId;
  const effectiveData = parsedData ?? (hasNoResume ? null : queryResumeData);

  const { isSaving, save, continueToDashboard } = useResumeVerify({
    resumeId: effectiveResumeId,
  });
  const [validationErrors, setValidationErrors] =
    useState<ResumeValidationErrors | null>(null);

  const initialData: ResumeData = effectiveData ?? {
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

  if (isLoadingResume && !parsedData) {
    return <Loading className="min-h-0 flex-1" />;
  }

  if (!effectiveResumeId) {
    return (
      <main className="w-form rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-1 px-7 pt-7">
          <h2 className="text-card-title">Nenhum currículo encontrado</h2>
          <p className="text-card-description">
            Faça o upload do seu currículo para verificá-lo e continuar.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 p-7">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <FileQuestion className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Envie um arquivo PDF ou DOCX para começar o processo de verificação.
          </p>
          <Button variant="brand" size="brand" className="rounded-lg" asChild>
            <Link href={ROUTE_ONBOARDING_UPLOAD} className="gap-2">
              <Upload className="h-4 w-4" />
              Ir para upload
            </Link>
          </Button>
        </div>
      </main>
    );
  }

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
