"use client";

import { useResumeVerify } from "@/hooks/use-resume-verify";
import { useResumeForm } from "@/hooks/use-resume-form";
import type { ResumeData } from "@/types/resume";
import { createEmptyEducation, createEmptyExperience } from "@/types/resume";
import { ResumeFormCard } from "@/components/shared/resume-form-card";

export function VerifyContent() {
  const { resumeContent, setResumeContent, isSaving, continueToDashboard } =
    useResumeVerify();

  const initialData: ResumeData = {
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
  } = useResumeForm({
    initialData,
    onSummarySync: setResumeContent,
  });

  return (
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
        label: "Continuar",
        onClick: continueToDashboard,
        disabled: isSaving || !isFormValid,
      }}
    />
  );
}
