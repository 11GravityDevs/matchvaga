"use client";

import { useResume } from "@/hooks/use-resume";
import { useResumeForm } from "@/hooks/use-resume-form";
import { ResumeFormCard } from "@/components/shared/resume-form-card";
import {
  PAGE_PADDING,
  PAGE_SUBTITLE_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_GAP,
} from "@/constants/design-tokens";
import { W_FORM } from "@/constants/design-tokens";

export function ResumeContent() {
  const { resumeData, save, isSaving, error } = useResume();

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
  } = useResumeForm({
    initialData: resumeData,
  });

  const handleSave = async () => {
    try {
      await save(data);
    } catch {
      // Error is set in useResume and displayed below
    }
  };

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
      <div className={`flex flex-col gap-1 ${W_FORM}`}>
        <h1 className={PAGE_TITLE_CLASS}>Edite seu currículo</h1>
        <p className={PAGE_SUBTITLE_CLASS}>
          Atualize suas informações e salve as alterações.
        </p>
      </div>
      <ResumeFormCard
        data={data}
        updateField={updateField}
        updateExperience={updateExperience}
        addExperience={addExperience}
        removeExperience={removeExperience}
        updateEducation={updateEducation}
        addEducation={addEducation}
        removeEducation={removeEducation}
        handleSummaryChange={handleSummaryChange}
        isSaving={isSaving}
        primaryAction={{
          label: "Salvar",
          onClick: handleSave,
          disabled: isSaving || !isFormValid,
          loading: isSaving,
        }}
        hideHeader
      />
    </div>
  );
}
