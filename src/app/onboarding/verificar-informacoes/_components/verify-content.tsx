"use client";

import { useEffect, useRef, useState } from "react";
import { useResumeVerify } from "../_hooks/use-resume-verify";
import {
  useResumeForm,
  type ResumeValidationErrors,
} from "@/hooks/use-resume-form";
import { useResumeFormValidation } from "@/hooks/use-resume-form-validation";
import { useResumeQuery } from "@/hooks/use-resume-query";
import type { ResumeData } from "@/types/resume";
import { createEmptyEducation, createEmptyExperience } from "@/types/resume";
import { prepareResumeFormInitialData } from "@/utils/resume";
import { ResumeFormCard } from "@/components/shared/resume-form-card";
import { Loading } from "@/components/ui/loading";
import { useToastNotification } from "@/hooks/use-toast-notification";
import { getResumeValidationErrors } from "@/utils/resume-validation";
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
  hardSkills: [],
  softSkills: [],
  languages: [],
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
});

function getFormKey(resumeId: string | null, hasResumeData: boolean): string {
  if (resumeId && hasResumeData) return resumeId;
  return "no-resume";
}

export interface VerifyContentProps {
  prefillValidationErrors?: boolean;
}

export function VerifyContent({
  prefillValidationErrors = false,
}: VerifyContentProps) {
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
  const [initialValidationErrors, setInitialValidationErrors] =
    useState<ResumeValidationErrors | null>(null);
  const { showErrorToastNotification } = useToastNotification();
  const hasSetBlockedErrors = useRef(false);
  const initialDataRef = useRef<ResumeData | null>(null);

  const rawInitialData: ResumeData =
    resumeData ?? EMPTY_INITIAL_DATA(resumeContent);
  const initialData = prepareResumeFormInitialData(rawInitialData);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  useEffect(() => {
    if (!prefillValidationErrors || isLoadingResume) return;
    if (hasSetBlockedErrors.current) return;

    const data = initialDataRef.current;
    if (!data) return;

    hasSetBlockedErrors.current = true;
    const errors = getResumeValidationErrors(data);
    queueMicrotask(() => setInitialValidationErrors(errors ?? null));
  }, [prefillValidationErrors, isLoadingResume]);

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
      initialValidationErrors={initialValidationErrors}
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
  initialValidationErrors,
  showErrorToastNotification,
}: {
  initialData: ResumeData;
  setResumeContent: (content: string) => void;
  isSaving: boolean;
  save: (data: ResumeData) => Promise<void>;
  continueToDashboard: () => void;
  initialValidationErrors: ResumeValidationErrors | null;
  showErrorToastNotification: (message: string) => void;
}) {
  const {
    data,
    isDirty,
    updateField,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    handleSummaryChange,
  } = useResumeForm({
    initialData,
    onSummarySync: setResumeContent,
  });

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const {
    validationErrors,
    setValidationErrors,
    scrollToFirstError,
    wrappedUpdateField,
    wrappedUpdateExperience,
    wrappedRemoveExperience,
    wrappedUpdateEducation,
    wrappedRemoveEducation,
    wrappedHandleSummaryChange,
    validateBeforeSubmit,
    setFormError,
  } = useResumeFormValidation({
    updateField,
    updateExperience,
    removeExperience,
    updateEducation,
    removeEducation,
    handleSummaryChange,
  });

  useEffect(() => {
    setValidationErrors(initialValidationErrors);
  }, [initialValidationErrors, setValidationErrors]);

  async function handleContinue() {
    if (!validateBeforeSubmit(data)) {
      return;
    }

    try {
      await save(data);
      continueToDashboard();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar.";
      setFormError(message);
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
      headerTitle="Verifique seus dados"
      headerSubtitle="Revisamos e extraimos as informações do seu currículo. Confira e edite se necessário."
      data={data}
      updateField={wrappedUpdateField}
      updateExperience={wrappedUpdateExperience}
      addExperience={addExperience}
      removeExperience={wrappedRemoveExperience}
      updateEducation={wrappedUpdateEducation}
      addEducation={addEducation}
      removeEducation={wrappedRemoveEducation}
      handleSummaryChange={wrappedHandleSummaryChange}
      isSaving={isSaving}
      primaryAction={{
        label: "Continuar",
        onClick: handleContinue,
        disabled: isSaving,
      }}
      validationErrors={validationErrors}
      scrollToFirstError={scrollToFirstError}
    />
  );
}
