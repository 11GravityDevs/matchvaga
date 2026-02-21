"use client";

import { useResume } from "@/hooks/use-resume";
import { useResumeForm } from "@/hooks/use-resume-form";
import { ResumeFormCard } from "@/components/shared/resume-form-card";

export function ResumeContent() {
  const { resumeData, save, isSaving } = useResume();

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

  const handleSave = () => {
    save(data);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 overflow-auto py-12">
      <div className="flex w-[706px] flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.5px] text-foreground">
          Edite seu currículo
        </h1>
        <p className="text-base font-normal text-muted-foreground">
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
        }}
        hideHeader
      />
    </div>
  );
}
