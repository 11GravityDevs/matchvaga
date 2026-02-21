"use client";

import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
} from "@/types/resume";
import { SECTION_TITLE_CLASS } from "@/components/shared/resume-form-constants";
import { ResumeFormPersonalData } from "@/components/shared/resume-form-personal-data";
import { ResumeFormSkills } from "@/components/shared/resume-form-skills";
import { ResumeFormEducation } from "@/components/shared/resume-form-education";
import { ResumeFormExperience } from "@/components/shared/resume-form-experience";

export interface ResumeFormCardPrimaryAction {
  label: string;
  onClick: () => void;
  disabled: boolean;
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
}

const DEFAULT_HEADER_TITLE = "Verifique seus dados";
const DEFAULT_HEADER_SUBTITLE =
  "Revisamos e extraimos as informações do seu currículo. Confira e edite se necessário.";

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
}: ResumeFormCardProps) {
  return (
    <div className="w-[706px] rounded-xl border border-border bg-card shadow-(--shadow-card)">
      {!hideHeader && (
        <div className="flex flex-col gap-1 px-7 pt-7">
          <h2 className="text-[24px] leading-[1.3] font-bold text-foreground">
            {headerTitle}
          </h2>
          <p className="text-sm leading-[1.4] text-muted-foreground">
            {headerSubtitle}
          </p>
        </div>
      )}

      <div
        className={`flex flex-col gap-5 overflow-hidden p-7 ${hideHeader ? "" : "pt-0"}`}
      >
        <ResumeFormPersonalData
          data={data}
          updateField={updateField}
          isSaving={isSaving}
        />

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

        <ResumeFormSkills
          skills={data.skills}
          onChange={(skills) => updateField("skills", skills)}
          isSaving={isSaving}
        />

        <ResumeFormEducation
          education={data.education}
          updateEducation={updateEducation}
          addEducation={addEducation}
          removeEducation={removeEducation}
          isSaving={isSaving}
        />

        <ResumeFormExperience
          experience={data.experience}
          updateExperience={updateExperience}
          addExperience={addExperience}
          removeExperience={removeExperience}
          isSaving={isSaving}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className="cursor-pointer rounded-lg bg-accent-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {primaryAction.label}
          </button>
        </div>
      </div>
    </div>
  );
}
