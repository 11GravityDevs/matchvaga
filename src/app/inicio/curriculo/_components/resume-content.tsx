"use client";

import { useEffect } from "react";
import { useResume } from "../_hooks/use-resume";
import { useResumeForm } from "@/hooks/use-resume-form";
import { useResumeFormValidation } from "@/hooks/use-resume-form-validation";
import { ResumeFormCard } from "@/components/shared/resume-form-card";
import { Loading } from "@/components/ui/loading";
import type { ResumeData } from "@/types/resume";
import { useToastNotification } from "@/hooks/use-toast-notification";
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context";
import { prepareResumeFormInitialData } from "@/utils/resume";

interface ResumeEditFormProps {
  initialData: ResumeData;
  save: (data: ResumeData) => Promise<void>;
  isSaving: boolean;
}

function ResumeEditForm({ initialData, save, isSaving }: ResumeEditFormProps) {
  const { showErrorToastNotification, showSuccessToastNotification } =
    useToastNotification();

  const {
    data,
    isDirty,
    reset,
    updateField,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    handleSummaryChange,
  } = useResumeForm({ initialData });

  const { setDirty, setOnBeforeLeave } = useUnsavedChanges();

  useEffect(() => {
    setDirty(isDirty);
    return () => setDirty(false);
  }, [isDirty, setDirty]);

  useEffect(() => {
    setOnBeforeLeave(reset);
    return () => setOnBeforeLeave(undefined);
  }, [reset, setOnBeforeLeave]);

  const {
    validationErrors,
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

  async function handleSave() {
    if (!validateBeforeSubmit(data)) {
      return;
    }

    try {
      await save(data);
      showSuccessToastNotification("Currículo salvo com sucesso.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao salvar. Tente novamente.";
      setFormError(message);
      showErrorToastNotification(message);
    }
  }

  return (
    <div className="flex w-full flex-col items-center section-gap overflow-auto page-padding">
      <ResumeFormCard
        headerTitle="Edite seu currículo"
        headerSubtitle="Atualize suas informações e salve as alterações."
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
          label: "Salvar",
          onClick: handleSave,
          disabled: isSaving,
          loading: isSaving,
        }}
        validationErrors={validationErrors}
        scrollToFirstError={scrollToFirstError}
      />
    </div>
  );
}

export function ResumeContent() {
  const { resumeData, isLoading, save, isSaving } = useResume();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ResumeEditForm
      initialData={prepareResumeFormInitialData(resumeData)}
      save={save}
      isSaving={isSaving}
    />
  );
}
