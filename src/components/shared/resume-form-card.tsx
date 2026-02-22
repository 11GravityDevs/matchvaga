"use client";

import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
} from "@/types/resume";

import { Button } from "@/components/ui/button";
import {
  CARD_DESCRIPTION_CLASS,
  CARD_TITLE_CLASS,
  SECTION_TITLE_CLASS,
  W_CONTENT,
} from "@/constants/design-tokens";
import { Textarea } from "@/components/ui/textarea";
import { ResumeFormPersonalData } from "@/components/shared/resume-form-personal-data";
import { ResumeFormSkills } from "@/components/shared/resume-form-skills";
import { ResumeFormEducation } from "@/components/shared/resume-form-education";
import { ResumeFormExperience } from "@/components/shared/resume-form-experience";

export interface ResumeFormCardPrimaryAction {
  label: string;
  onClick: () => void;
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
    <div className={`rounded-xl border border-border bg-card ${W_CONTENT}`}>
      {!hideHeader && (
        <div className="flex flex-col gap-1 p-7">
          <h2 className={CARD_TITLE_CLASS}>{headerTitle}</h2>
          <p className={CARD_DESCRIPTION_CLASS}>{headerSubtitle}</p>
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
          <Textarea
            id="summary"
            value={data.summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            disabled={isSaving}
            variant="form"
            className="w-full"
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
