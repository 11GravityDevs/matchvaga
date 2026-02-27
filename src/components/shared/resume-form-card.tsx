"use client";

import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
} from "@/types/resume";
import type { ResumeValidationErrors } from "@/hooks/use-resume-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResumeFormPersonalData } from "@/components/shared/resume-form-personal-data";
import { ResumeFormSkills } from "@/components/shared/resume-form-skills";
import { ResumeFormLanguages } from "@/components/shared/resume-form-languages";
import { ResumeFormEducation } from "@/components/shared/resume-form-education";
import { ResumeFormExperience } from "@/components/shared/resume-form-experience";

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
}

export { INPUT_CLASS };

const INPUT_CLASS =
  "h-9 bg-background px-3 shadow-none focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30";

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
  validationErrors,
}: ResumeFormCardProps) {
  return (
    <div className="w-content rounded-xl border border-border bg-card">
      {!hideHeader && (
        <div className="flex flex-col gap-1 p-7">
          <h2 className="text-card-title">{headerTitle}</h2>
          <p className="text-card-description">{headerSubtitle}</p>
        </div>
      )}

      <div
        className={`flex flex-col gap-5 overflow-hidden p-7 ${hideHeader ? "" : "pt-0"}`}
      >
        {validationErrors?.form && (
          <p className="text-sm text-destructive" role="alert">
            {validationErrors.form}
          </p>
        )}
        <ResumeFormPersonalData
          data={data}
          updateField={updateField}
          isSaving={isSaving}
          validationErrors={validationErrors}
        />

        <div className="flex flex-col gap-4">
          <h3 className="text-section-title">Resumo profissional</h3>
          <Textarea
            id="summary"
            value={data.summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            disabled={isSaving}
            variant="form"
            className="w-full"
          />
          {validationErrors?.summary && (
            <p className="text-sm text-destructive" role="alert">
              {validationErrors.summary}
            </p>
          )}
        </div>

        <ResumeFormSkills
          skills={data.skills}
          onChange={(skills) => updateField("skills", skills)}
          isSaving={isSaving}
          skillsError={validationErrors?.skills}
        />

        <ResumeFormLanguages
          languages={data.languages ?? []}
          onChange={(languages) => updateField("languages", languages)}
          isSaving={isSaving}
          languagesError={validationErrors?.languages}
        />

        <ResumeFormEducation
          education={data.education}
          updateEducation={updateEducation}
          addEducation={addEducation}
          removeEducation={removeEducation}
          isSaving={isSaving}
          educationError={validationErrors?.education}
        />

        <ResumeFormExperience
          experience={data.experience}
          updateExperience={updateExperience}
          addExperience={addExperience}
          removeExperience={removeExperience}
          isSaving={isSaving}
          experienceError={validationErrors?.experience}
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
