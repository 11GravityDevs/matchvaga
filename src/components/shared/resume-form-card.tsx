"use client";

import { useEffect } from "react";
import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
} from "@/types/resume";
import type { ResumeValidationErrors } from "@/hooks/use-resume-form";
import { RESUME_LIMITS } from "@/constants/resume";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResumeFormPersonalData } from "@/components/shared/resume-form-personal-data";
import { ResumeFormSkills } from "@/components/shared/resume-form-skills";
import { ResumeFormLanguages } from "@/components/shared/resume-form-languages";
import { ResumeFormEducation } from "@/components/shared/resume-form-education";
import { ResumeFormExperience } from "@/components/shared/resume-form-experience";
import { FormSectionSeparator } from "@/components/shared/form-section-separator";

export interface ResumeFormCardPrimaryAction {
  label: string;
  onClick: () => void | Promise<void>;
  disabled: boolean;
  loading?: boolean;
}

export interface ResumeFormCardProps {
  data: ResumeData;
  updateField: <K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) => void;
  updateExperience: (index: number, updates: Partial<ExperienceEntry>) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  updateEducation: (index: number, updates: Partial<EducationEntry>) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
  handleSummaryChange: (value: string) => void;
  isSaving?: boolean;
  primaryAction: ResumeFormCardPrimaryAction;
  headerTitle?: string;
  headerSubtitle?: string;
  hideHeader?: boolean;
  validationErrors?: ResumeValidationErrors | null;
  scrollToFirstError?: boolean;
}

export { INPUT_CLASS };

const INPUT_CLASS =
  "h-9 bg-background px-3 shadow-none focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30";

const DEFAULT_HEADER_TITLE = "Verifique seus dados";
const DEFAULT_HEADER_SUBTITLE =
  "Revisamos e extraimos as informações do seu currículo. Confira e edite se necessário.";

const ERROR_FIELD_ORDER = [
  "form",
  "fullName",
  "email",
  "location",
  "phone",
  "summary",
  "hardSkills",
  "softSkills",
  "education",
  "experience",
] as const;

function getScrollTargetId(
  key: (typeof ERROR_FIELD_ORDER)[number],
  validationErrors: ResumeValidationErrors
): string {
  if (key === "form") return "resume-form-error";

  if (key === "education") {
    const firstErrorIndex = validationErrors.educationEntryErrors?.findIndex(
      (e) => Object.keys(e).length > 0
    );

    if (firstErrorIndex !== undefined && firstErrorIndex >= 0) {
      return `resume-form-education-entry-${firstErrorIndex}`;
    }

    return "resume-form-education";
  }

  if (key === "experience") {
    const firstErrorIndex = validationErrors.experienceEntryErrors?.findIndex(
      (e) => Object.keys(e).length > 0
    );

    if (firstErrorIndex !== undefined && firstErrorIndex >= 0) {
      return `resume-form-experience-entry-${firstErrorIndex}`;
    }

    return "resume-form-experience";
  }

  return `resume-form-${key}`;
}

function hasValidationError(
  key: (typeof ERROR_FIELD_ORDER)[number],
  validationErrors: ResumeValidationErrors
): boolean {
  if (key === "education") {
    return (
      !!validationErrors.education ||
      (!!validationErrors.educationEntryErrors?.length &&
        validationErrors.educationEntryErrors.some(
          (e) => Object.keys(e).length > 0
        ))
    );
  }

  if (key === "experience") {
    return (
      !!validationErrors.experience ||
      (!!validationErrors.experienceEntryErrors?.length &&
        validationErrors.experienceEntryErrors.some(
          (e) => Object.keys(e).length > 0
        ))
    );
  }

  return !!validationErrors[key];
}

export function ResumeFormCard({
  data,
  updateField,
  updateExperience,
  addExperience,
  removeExperience,
  updateEducation,
  addEducation,
  removeEducation,
  handleSummaryChange,
  isSaving,
  primaryAction,
  headerTitle = DEFAULT_HEADER_TITLE,
  headerSubtitle = DEFAULT_HEADER_SUBTITLE,
  hideHeader = false,
  validationErrors,
  scrollToFirstError = false,
}: ResumeFormCardProps) {
  useEffect(() => {
    if (!scrollToFirstError || !validationErrors) return;

    const firstKey = ERROR_FIELD_ORDER.find((key) =>
      hasValidationError(key, validationErrors)
    );

    if (!firstKey) return;

    const id = getScrollTargetId(firstKey, validationErrors);
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    return () => clearTimeout(timer);
  }, [scrollToFirstError, validationErrors]);

  return (
    <div className="w-content rounded-xl border border-border bg-card">
      {!hideHeader && (
        <div className="flex flex-col gap-1 p-7">
          <h2 className="text-card-title">{headerTitle}</h2>
          <p className="text-card-description">{headerSubtitle}</p>
        </div>
      )}

      <div
        className={`flex flex-col gap-6 overflow-hidden p-7 ${hideHeader ? "" : "pt-0"}`}
      >
        {validationErrors?.form && (
          <div id="resume-form-error" className="scroll-mt-6 scroll-mb-6">
            <p className="text-sm text-destructive" role="alert">
              {validationErrors.form}
            </p>
          </div>
        )}
        <ResumeFormPersonalData
          data={data}
          updateField={updateField}
          isSaving={isSaving}
          validationErrors={validationErrors}
        />

        <FormSectionSeparator />

        <div
          id="resume-form-summary"
          className="flex scroll-mt-6 scroll-mb-6 flex-col gap-4"
        >
          <h3 className="text-section-title">Resumo profissional</h3>
          <Textarea
            id="summary"
            value={data.summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            disabled={isSaving}
            maxLength={RESUME_LIMITS.SUMMARY_MAX}
            variant="form"
            className="w-full"
            aria-invalid={!!validationErrors?.summary}
          />
          {validationErrors?.summary && (
            <p className="text-sm text-destructive" role="alert">
              {validationErrors.summary}
            </p>
          )}
        </div>

        <FormSectionSeparator />

        <ResumeFormSkills
          id="resume-form-hardSkills"
          title="Habilidades Técnicas"
          placeholder="Digite uma habilidade técnica e pressione Enter"
          addButtonText="Adicionar habilidade"
          skills={data.hardSkills}
          onChange={(skills) => updateField("hardSkills", skills)}
          isSaving={isSaving}
          skillsError={validationErrors?.hardSkills}
          duplicateErrorMessage="Esta habilidade técnica já foi adicionada."
        />

        <FormSectionSeparator />

        <ResumeFormSkills
          id="resume-form-softSkills"
          title="Competências Comportamentais"
          placeholder="Digite uma competência e pressione Enter"
          addButtonText="Adicionar competência"
          skills={data.softSkills}
          onChange={(skills) => updateField("softSkills", skills)}
          isSaving={isSaving}
          skillsError={validationErrors?.softSkills}
          duplicateErrorMessage="Esta competência já foi adicionada."
        />

        <FormSectionSeparator />

        <ResumeFormLanguages
          languages={data.languages ?? []}
          onChange={(languages) => updateField("languages", languages)}
          isSaving={isSaving}
        />

        <FormSectionSeparator />

        <ResumeFormEducation
          education={data.education}
          updateEducation={updateEducation}
          addEducation={addEducation}
          removeEducation={removeEducation}
          isSaving={isSaving}
          educationError={validationErrors?.education}
          educationEntryErrors={validationErrors?.educationEntryErrors}
        />

        <FormSectionSeparator />

        <ResumeFormExperience
          experience={data.experience}
          updateExperience={updateExperience}
          addExperience={addExperience}
          removeExperience={removeExperience}
          isSaving={isSaving}
          experienceError={validationErrors?.experience}
          experienceEntryErrors={validationErrors?.experienceEntryErrors}
        />

        <div className="h-6" />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            loading={primaryAction.loading}
            variant="brand"
            size="brand"
            className="rounded-lg"
          >
            {primaryAction.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
