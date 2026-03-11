"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  BriefcaseBusiness,
  Code2,
  FileText,
  GraduationCap,
  Languages,
  UserRound,
} from "lucide-react";
import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
} from "@/types/resume";
import type { ResumeValidationErrors } from "@/hooks/use-resume-form";
import { RESUME_LIMITS } from "@/constants/resume";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResumeFormEducation } from "@/components/shared/resume-form-education";
import { ResumeFormExperience } from "@/components/shared/resume-form-experience";
import { ResumeFormLanguages } from "@/components/shared/resume-form-languages";
import { ResumeFormPersonalData } from "@/components/shared/resume-form-personal-data";
import {
  ResumeFormCollapsibleSectionCard,
  type ResumeFormSectionId,
} from "@/components/shared/resume-form-collapsible-section-card";
import { ResumeFormSkills } from "@/components/shared/resume-form-skills";

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
  validationErrors?: ResumeValidationErrors | null;
  scrollToFirstError?: boolean;
}

interface SectionErrorConfig {
  id: ResumeFormSectionId;
  errorKeys: Array<(typeof ERROR_FIELD_ORDER)[number]>;
}

interface SectionConfig {
  id: ResumeFormSectionId;
  title: string;
  icon: LucideIcon;
  content: ReactNode;
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

const SECTION_ERROR_CONFIGS: SectionErrorConfig[] = [
  { id: "personalData", errorKeys: ["fullName", "email", "location", "phone"] },
  { id: "summary", errorKeys: ["summary"] },
  { id: "hardSkills", errorKeys: ["hardSkills"] },
  { id: "softSkills", errorKeys: ["softSkills"] },
  { id: "languages", errorKeys: [] },
  { id: "education", errorKeys: ["education"] },
  { id: "experience", errorKeys: ["experience"] },
];

function createInitialExpandedSections(): Record<ResumeFormSectionId, boolean> {
  return {
    personalData: true,
    summary: false,
    hardSkills: false,
    softSkills: false,
    languages: false,
    education: false,
    experience: false,
  };
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
          (entryError) => Object.keys(entryError).length > 0
        ))
    );
  }

  if (key === "experience") {
    return (
      !!validationErrors.experience ||
      (!!validationErrors.experienceEntryErrors?.length &&
        validationErrors.experienceEntryErrors.some(
          (entryError) => Object.keys(entryError).length > 0
        ))
    );
  }

  return !!validationErrors[key];
}

function getScrollTargetId(
  key: (typeof ERROR_FIELD_ORDER)[number],
  validationErrors: ResumeValidationErrors
): string {
  if (key === "form") return "resume-form-error";

  if (key === "education") {
    const firstErrorIndex = validationErrors.educationEntryErrors?.findIndex(
      (entryError) => Object.keys(entryError).length > 0
    );

    if (firstErrorIndex !== undefined && firstErrorIndex >= 0) {
      return `resume-form-education-entry-${firstErrorIndex}`;
    }

    return "resume-form-education";
  }

  if (key === "experience") {
    const firstErrorIndex = validationErrors.experienceEntryErrors?.findIndex(
      (entryError) => Object.keys(entryError).length > 0
    );

    if (firstErrorIndex !== undefined && firstErrorIndex >= 0) {
      return `resume-form-experience-entry-${firstErrorIndex}`;
    }

    return "resume-form-experience";
  }

  return `resume-form-${key}`;
}

function getSectionsWithErrors(
  validationErrors: ResumeValidationErrors
): ResumeFormSectionId[] {
  return SECTION_ERROR_CONFIGS.filter((section) =>
    section.errorKeys.some((errorKey) =>
      hasValidationError(errorKey, validationErrors)
    )
  ).map((section) => section.id);
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
  validationErrors,
  scrollToFirstError = false,
}: ResumeFormCardProps) {
  const [expandedSections, setExpandedSections] = useState(
    createInitialExpandedSections
  );

  const sections: SectionConfig[] = [
    {
      id: "personalData",
      title: "Dados pessoais",
      icon: UserRound,
      content: (
        <ResumeFormPersonalData
          data={data}
          updateField={updateField}
          isSaving={isSaving}
          validationErrors={validationErrors}
        />
      ),
    },
    {
      id: "summary",
      title: "Resumo profissional",
      icon: FileText,
      content: (
        <div
          id="resume-form-summary"
          className="flex scroll-mt-6 scroll-mb-6 flex-col gap-4"
        >
          <Textarea
            autoResize
            id="summary"
            value={data.summary}
            onChange={(event) => handleSummaryChange(event.target.value)}
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
      ),
    },
    {
      id: "hardSkills",
      title: "Habilidades Técnicas",
      icon: Code2,
      content: (
        <ResumeFormSkills
          id="resume-form-hardSkills"
          placeholder="Digite uma habilidade técnica e pressione Enter"
          addButtonText="Adicionar habilidade"
          skills={data.hardSkills}
          onChange={(skills) => updateField("hardSkills", skills)}
          isSaving={isSaving}
          skillsError={validationErrors?.hardSkills}
          duplicateErrorMessage="Esta habilidade técnica já foi adicionada."
        />
      ),
    },
    {
      id: "softSkills",
      title: "Competências Comportamentais",
      icon: Brain,
      content: (
        <ResumeFormSkills
          id="resume-form-softSkills"
          placeholder="Digite uma competência e pressione Enter"
          addButtonText="Adicionar competência"
          skills={data.softSkills}
          onChange={(skills) => updateField("softSkills", skills)}
          isSaving={isSaving}
          skillsError={validationErrors?.softSkills}
          duplicateErrorMessage="Esta competência já foi adicionada."
        />
      ),
    },
    {
      id: "languages",
      title: "Idiomas",
      icon: Languages,
      content: (
        <ResumeFormLanguages
          languages={data.languages ?? []}
          onChange={(languages) => updateField("languages", languages)}
          isSaving={isSaving}
        />
      ),
    },
    {
      id: "education",
      title: "Formação",
      icon: GraduationCap,
      content: (
        <ResumeFormEducation
          education={data.education}
          updateEducation={updateEducation}
          addEducation={addEducation}
          removeEducation={removeEducation}
          isSaving={isSaving}
          educationError={validationErrors?.education}
          educationEntryErrors={validationErrors?.educationEntryErrors}
        />
      ),
    },
    {
      id: "experience",
      title: "Experiência",
      icon: BriefcaseBusiness,
      content: (
        <ResumeFormExperience
          experience={data.experience}
          updateExperience={updateExperience}
          addExperience={addExperience}
          removeExperience={removeExperience}
          isSaving={isSaving}
          experienceError={validationErrors?.experience}
          experienceEntryErrors={validationErrors?.experienceEntryErrors}
        />
      ),
    },
  ];

  const sectionsWithErrors = useMemo(() => {
    if (!validationErrors) {
      return new Set<ResumeFormSectionId>();
    }

    return new Set(getSectionsWithErrors(validationErrors));
  }, [validationErrors]);

  useEffect(() => {
    if (!scrollToFirstError || !validationErrors) return;

    const firstKey = ERROR_FIELD_ORDER.find((errorKey) =>
      hasValidationError(errorKey, validationErrors)
    );

    if (!firstKey) return;

    const scrollTargetId = getScrollTargetId(firstKey, validationErrors);
    const timer = setTimeout(() => {
      const element = document.getElementById(scrollTargetId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    return () => clearTimeout(timer);
  }, [scrollToFirstError, validationErrors]);

  const handleToggleSection = (sectionId: ResumeFormSectionId) => {
    setExpandedSections((currentExpandedSections) => {
      const sectionHasErrors = sectionsWithErrors.has(sectionId);

      if (sectionHasErrors) {
        return {
          ...currentExpandedSections,
          [sectionId]: true,
        };
      }

      return {
        ...currentExpandedSections,
        [sectionId]: !currentExpandedSections[sectionId],
      };
    });
  };

  return (
    <div className="flex w-content flex-col section-gap">
      <div className="flex w-content flex-col gap-1">
        <h1 className="text-page-title">{headerTitle}</h1>
        <p className="text-page-subtitle">{headerSubtitle}</p>
      </div>

      <div className="flex flex-col gap-6">
        {validationErrors?.form && (
          <div id="resume-form-error" className="scroll-mt-6 scroll-mb-6">
            <p className="text-sm text-destructive" role="alert">
              {validationErrors.form}
            </p>
          </div>
        )}

        {sections.map((section) => (
          <ResumeFormCollapsibleSectionCard
            key={section.id}
            sectionId={section.id}
            title={section.title}
            icon={section.icon}
            isExpanded={
              expandedSections[section.id] || sectionsWithErrors.has(section.id)
            }
            onToggle={handleToggleSection}
          >
            {section.content}
          </ResumeFormCollapsibleSectionCard>
        ))}

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
