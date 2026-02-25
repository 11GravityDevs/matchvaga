"use client";

import { useState } from "react";
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

  async function handleContinue() {
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
  }

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
