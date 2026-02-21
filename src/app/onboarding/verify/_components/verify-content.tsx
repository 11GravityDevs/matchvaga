"use client";

import { useCallback, useMemo, useState } from "react";
import { useResumeVerify } from "@/hooks/use-resume-verify";
import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
} from "@/types/resume";
import { createEmptyEducation, createEmptyExperience } from "@/types/resume";

import { VerifyPersonalData } from "./verify-personal-data";
import { VerifyExperience } from "./verify-experience";
import { VerifyEducation } from "./verify-education";
import { VerifySkills } from "./verify-skills";

export const SECTION_TITLE_CLASS = "text-[20px] font-bold text-foreground";
export const SECTION_ITEM_LABEL_CLASS = "text-[15px] font-bold text-foreground";
export const SUB_LABEL_CLASS = "text-xs font-medium text-foreground";
export const INPUT_CLASS =
  "h-9 bg-background px-3 shadow-none focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30";

export function VerifyContent() {
  const { resumeContent, setResumeContent, isSaving, continueToDashboard } =
    useResumeVerify();
  const [data, setData] = useState<ResumeData>({
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
  });

  const updateField = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateExperience = useCallback(
    (index: number, updates: Partial<ExperienceEntry>) => {
      setData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp, i) =>
          i === index ? { ...exp, ...updates } : exp
        ),
      }));
    },
    []
  );

  const addExperience = useCallback(() => {
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, createEmptyExperience()],
    }));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);

  const updateEducation = useCallback(
    (index: number, updates: Partial<EducationEntry>) => {
      setData((prev) => ({
        ...prev,
        education: prev.education.map((edu, i) =>
          i === index ? { ...edu, ...updates } : edu
        ),
      }));
    },
    []
  );

  const addEducation = useCallback(() => {
    setData((prev) => ({
      ...prev,
      education: [...prev.education, createEmptyEducation()],
    }));
  }, []);

  const removeEducation = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSummaryChange = useCallback(
    (value: string) => {
      updateField("summary", value);
      setResumeContent(value);
    },
    [setResumeContent, updateField]
  );

  const isFormValid = useMemo(() => {
    const hasRequiredPersonalData =
      data.fullName.trim() !== "" &&
      data.email.trim() !== "" &&
      data.location.trim() !== "" &&
      data.phone.trim() !== "";
    const hasSummary = data.summary.trim() !== "";
    const hasValidExperience = data.experience.some(
      (exp) => exp.company.trim() !== "" && exp.jobTitle.trim() !== ""
    );
    const hasValidEducation = data.education.some(
      (edu) =>
        edu.institution.trim() !== "" &&
        edu.course.trim() !== "" &&
        edu.level.trim() !== ""
    );
    return (
      hasRequiredPersonalData &&
      hasSummary &&
      hasValidExperience &&
      hasValidEducation
    );
  }, [data]);

  return (
    <div className="w-[706px] rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex flex-col gap-1 px-7 pt-7">
        <h2 className="text-[24px] leading-[1.3] font-bold text-foreground">
          Verifique seus dados
        </h2>
        <p className="text-sm leading-[1.4] text-muted-foreground">
          Revisamos e extraimos as informações do seu currículo. Confira e edite
          se necessário.
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 overflow-hidden p-7">
        <VerifyPersonalData
          data={data}
          updateField={updateField}
          isSaving={isSaving}
        />

        {/* Resumo profissional */}
        <div className="flex flex-col gap-4">
          <h3 className={SECTION_TITLE_CLASS}>Resumo profissional</h3>
          <textarea
            id="summary"
            value={data.summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            disabled={isSaving}
            className="h-[100px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-[13px] leading-normal text-foreground shadow-none transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <VerifySkills
          skills={data.skills}
          onChange={(skills) => updateField("skills", skills)}
          isSaving={isSaving}
        />

        <VerifyEducation
          education={data.education}
          updateEducation={updateEducation}
          addEducation={addEducation}
          removeEducation={removeEducation}
          isSaving={isSaving}
        />

        <VerifyExperience
          experience={data.experience}
          updateExperience={updateExperience}
          addExperience={addExperience}
          removeExperience={removeExperience}
          isSaving={isSaving}
        />

        {/* Button row */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={continueToDashboard}
            disabled={isSaving || !isFormValid}
            className="cursor-pointer rounded-lg bg-accent-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
