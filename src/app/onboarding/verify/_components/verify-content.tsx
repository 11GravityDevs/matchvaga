"use client";

import { useState } from "react";
import { useResumeVerify } from "../_hooks/use-resume-verify";
import {
  useResumeForm,
  type ResumeValidationErrors,
} from "@/hooks/use-resume-form";
import { useResumeQuery } from "@/hooks/use-resume-query";
import type { ResumeData } from "@/types/resume";
import { createEmptyEducation, createEmptyExperience } from "@/types/resume";
import { formatPhoneBr } from "@/utils/resume";
import { ResumeFormCard } from "@/components/shared/resume-form-card";
import { Loading } from "@/components/ui/loading";
import { useToastNotification } from "@/hooks/useToastNotification";
import { useOnboardingContext } from "../../_contexts/onboarding-context";

const VERIFY_THINKING_MESSAGES = [
  "Salvando alterações...",
  "Validando dados...",
  "Atualizando seu perfil...",
  "Finalizando...",
  "Redirecionando...",
] as const;

const EMPTY_INITIAL_DATA = (summary: string): ResumeData => ({
  fullName: "",
  email: "",
  location: "",
  phone: "",
  linkedin: "",
  github: "",
  summary,
  skills: [],
  languages: [],
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
});

function getFormKey(resumeId: string | null, hasResumeData: boolean): string {
  if (resumeId && hasResumeData) return resumeId;
  return "no-resume";
}

export function VerifyContent() {
  const { resumeContent, setResumeContent } = useOnboardingContext();
  const {
    resumeId: queryResumeId,
    resumeData: queryResumeData,
    hasNoResume,
    isLoading: isLoadingResume,
  } = useResumeQuery();

  const resumeId = queryResumeId;
  const resumeData = hasNoResume ? null : queryResumeData;

  const { isSaving, save, continueToDashboard } = useResumeVerify({ resumeId });
  const [validationErrors, setValidationErrors] =
    useState<ResumeValidationErrors | null>(null);
  const { showErrorToastNotification } = useToastNotification();

  const initialData: ResumeData =
    resumeData ?? EMPTY_INITIAL_DATA(resumeContent);

  if (isLoadingResume) {
    return <Loading className="min-h-0 flex-1" />;
  }

  return (
    <VerifyFormWithKey
      key={getFormKey(resumeId, !!resumeData)}
      initialData={initialData}
      setResumeContent={setResumeContent}
      isSaving={isSaving}
      save={save}
      continueToDashboard={continueToDashboard}
      validationErrors={validationErrors}
      setValidationErrors={setValidationErrors}
      showErrorToastNotification={showErrorToastNotification}
    />
  );
}

function VerifyFormWithKey({
  initialData,
  setResumeContent,
  isSaving,
  save,
  continueToDashboard,
  validationErrors,
  setValidationErrors,
  showErrorToastNotification,
}: {
  initialData: ResumeData;
  setResumeContent: (content: string) => void;
  isSaving: boolean;
  save: (data: ResumeData) => Promise<void>;
  continueToDashboard: () => void;
  validationErrors: ResumeValidationErrors | null;
  setValidationErrors: (errors: ResumeValidationErrors | null) => void;
  showErrorToastNotification: (message: string) => void;
}) {
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
    initialData: {
      ...initialData,
      phone: formatPhoneBr(initialData.phone),
    },
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
      const message = err instanceof Error ? err.message : "Erro ao salvar.";
      setValidationErrors({
        form: message,
      });
      showErrorToastNotification(message);
    }
  }

  if (isSaving) {
    return (
      <Loading
        thinkingMessages={[...VERIFY_THINKING_MESSAGES]}
        className="min-h-0 flex-1"
      />
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
      }}
      validationErrors={validationErrors}
    />
  );
}
