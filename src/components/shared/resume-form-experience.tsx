"use client";

import { Plus, Trash2 } from "lucide-react";
import { RESUME_LIMITS } from "@/constants/resume";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { DatePickerField } from "@/components/shared/date-picker-field";
import type { ExperienceEntry } from "@/types/resume";
import type { ExperienceEntryFieldErrors } from "@/hooks/use-resume-form";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";

interface ResumeFormExperienceProps {
  experience: ExperienceEntry[];
  updateExperience: (index: number, updates: Partial<ExperienceEntry>) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  isSaving?: boolean;
  experienceError?: string;
  experienceEntryErrors?: ExperienceEntryFieldErrors[];
}

export function ResumeFormExperience({
  experience,
  updateExperience,
  addExperience,
  removeExperience,
  isSaving,
  experienceError,
  experienceEntryErrors,
}: ResumeFormExperienceProps) {
  const hasCurrentExperience = experience.some((exp) => exp.isCurrent);

  return (
    <div
      id="resume-form-experience"
      className="flex scroll-mt-6 scroll-mb-6 flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="text-section-title">
          <span className="inline-flex items-baseline gap-1">
            Experiência
            <span className="align-baseline text-small font-normal text-muted-foreground">
              (opcional)
            </span>
          </span>
        </h3>
        {experienceError && (
          <p className="text-sm text-destructive" role="alert">
            {experienceError}
          </p>
        )}
      </div>
      {experience.map((exp, expIndex) => (
        <div
          key={expIndex}
          id={`resume-form-experience-entry-${expIndex}`}
          className="flex scroll-mt-6 scroll-mb-6 flex-col gap-4"
        >
          {experience.length > 1 && (
            <h4 className="text-section-item-label">
              Experiência {expIndex + 1}
            </h4>
          )}
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-8">
              <FormField
                label="Empresa"
                htmlFor={`exp-company-${expIndex}`}
                className="flex-1"
                error={experienceEntryErrors?.[expIndex]?.company}
              >
                <Input
                  id={`exp-company-${expIndex}`}
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(expIndex, { company: e.target.value })
                  }
                  disabled={isSaving}
                  className={INPUT_CLASS}
                  aria-invalid={!!experienceEntryErrors?.[expIndex]?.company}
                />
              </FormField>
              <FormField
                label="Cargo"
                htmlFor={`exp-job-${expIndex}`}
                className="flex-1"
                error={experienceEntryErrors?.[expIndex]?.jobTitle}
              >
                <Input
                  id={`exp-job-${expIndex}`}
                  value={exp.jobTitle}
                  onChange={(e) =>
                    updateExperience(expIndex, { jobTitle: e.target.value })
                  }
                  disabled={isSaving}
                  className={INPUT_CLASS}
                  aria-invalid={!!experienceEntryErrors?.[expIndex]?.jobTitle}
                />
              </FormField>
            </div>
            <div className="flex gap-8">
              <DatePickerField
                id={`exp-start-${expIndex}`}
                label="Data de início"
                value={exp.startDate}
                onChange={(value) =>
                  updateExperience(expIndex, { startDate: value })
                }
                disabled={isSaving}
                placeholder="Selecione a data de início"
                labelClassName="text-sub-label"
                className="flex-1"
                error={experienceEntryErrors?.[expIndex]?.startDate}
              />
              {!exp.isCurrent ? (
                <DatePickerField
                  id={`exp-end-${expIndex}`}
                  label="Data de término"
                  value={exp.endDate}
                  onChange={(value) =>
                    updateExperience(expIndex, { endDate: value })
                  }
                  disabled={isSaving}
                  placeholder="Selecione a data de término"
                  labelClassName="text-sub-label"
                  className="flex-1"
                  error={experienceEntryErrors?.[expIndex]?.endDate}
                />
              ) : (
                <div className="flex-1" />
              )}
            </div>
            {(exp.isCurrent || !hasCurrentExperience) && (
              <label className="flex cursor-pointer items-center gap-1 self-start">
                <Checkbox
                  className="cursor-pointer border-2 border-accent-brand data-[state=checked]:border-accent-brand data-[state=checked]:bg-accent-brand"
                  checked={exp.isCurrent ?? false}
                  onCheckedChange={(checked) =>
                    updateExperience(expIndex, {
                      isCurrent: checked === true,
                      ...(checked === true ? { endDate: "" } : {}),
                    })
                  }
                  disabled={isSaving}
                />
                <span className="text-small font-medium">
                  Atualmente trabalho aqui
                </span>
              </label>
            )}
            <FormField
              label="Local"
              htmlFor={`exp-location-${expIndex}`}
              labelClassName="text-sub-label"
              error={experienceEntryErrors?.[expIndex]?.location}
            >
              <Input
                id={`exp-location-${expIndex}`}
                value={exp.location}
                onChange={(e) =>
                  updateExperience(expIndex, { location: e.target.value })
                }
                disabled={isSaving}
                className={INPUT_CLASS}
                aria-invalid={!!experienceEntryErrors?.[expIndex]?.location}
              />
            </FormField>
            <FormField
              label="Descrição"
              htmlFor={`exp-desc-${expIndex}`}
              labelClassName="text-sub-label"
              error={experienceEntryErrors?.[expIndex]?.description}
            >
              <textarea
                id={`exp-desc-${expIndex}`}
                value={exp.description}
                onChange={(e) =>
                  updateExperience(expIndex, { description: e.target.value })
                }
                disabled={isSaving}
                className="h-32 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-none transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!experienceEntryErrors?.[expIndex]?.description}
              />
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructiveSolid"
              size="sm"
              onClick={() => removeExperience(expIndex)}
              className="w-fit gap-1.5 text-small"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="brand"
          size="sm"
          onClick={addExperience}
          disabled={
            isSaving || experience.length >= RESUME_LIMITS.EXPERIENCE_MAX
          }
          className="w-fit gap-1.5 text-small"
        >
          <Plus className="h-4 w-4" />
          Adicionar experiência
        </Button>
        {experience.length >= RESUME_LIMITS.EXPERIENCE_MAX && (
          <p className="text-small text-muted-foreground">
            Máximo de {RESUME_LIMITS.EXPERIENCE_MAX} experiências
          </p>
        )}
      </div>
    </div>
  );
}
