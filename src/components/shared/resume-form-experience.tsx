"use client";

import { Fragment, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { RESUME_LIMITS } from "@/constants/resume";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { MonthYearPickerField } from "@/components/shared/month-year-picker-field";
import { Textarea } from "@/components/ui/textarea";
import type { ExperienceEntry } from "@/types/resume";
import type { ExperienceEntryFieldErrors } from "@/hooks/use-resume-form";
import { FormSectionSeparator } from "@/components/shared/form-section-separator";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";
import { capitalizeLocation } from "@/utils/resume";
import { capitalizeTitleCase } from "@/utils/resume";

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
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  const handleConfirmRemove = () => {
    if (removeIndex !== null) {
      removeExperience(removeIndex);
      setRemoveIndex(null);
    }
  };

  return (
    <div
      id="resume-form-experience"
      className="flex scroll-mt-6 scroll-mb-6 flex-col"
    >
      <div className="flex flex-col gap-1.5">
        {experienceError && (
          <p className="text-sm text-destructive" role="alert">
            {experienceError}
          </p>
        )}
      </div>
      {experience.map((exp, expIndex) => (
        <Fragment key={expIndex}>
          <div
            id={`resume-form-experience-entry-${expIndex}`}
            className="flex scroll-mt-6 scroll-mb-6 flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-section-item-label">
                Experiência {expIndex + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive aria-expanded:text-destructive"
                onClick={() => setRemoveIndex(expIndex)}
                disabled={isSaving}
                aria-label="Remover experiência"
                aria-haspopup="dialog"
                aria-expanded={removeIndex === expIndex}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
                    onBlur={() => {
                      const capitalized = capitalizeTitleCase(exp.company);
                      if (capitalized !== exp.company) {
                        updateExperience(expIndex, { company: capitalized });
                      }
                    }}
                    disabled={isSaving}
                    maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
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
                    onBlur={() => {
                      const capitalized = capitalizeTitleCase(exp.jobTitle);
                      if (capitalized !== exp.jobTitle) {
                        updateExperience(expIndex, { jobTitle: capitalized });
                      }
                    }}
                    disabled={isSaving}
                    maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
                    className={INPUT_CLASS}
                    aria-invalid={!!experienceEntryErrors?.[expIndex]?.jobTitle}
                  />
                </FormField>
              </div>
              <div className="flex gap-8">
                <MonthYearPickerField
                  id={`exp-start-${expIndex}`}
                  label="Data de início"
                  value={exp.startDate}
                  onChange={(value) =>
                    updateExperience(expIndex, { startDate: value })
                  }
                  disabled={isSaving}
                  placeholder="Selecione mês e ano"
                  labelClassName="text-sub-label"
                  className="flex-1"
                  error={experienceEntryErrors?.[expIndex]?.startDate}
                />
                {!exp.isCurrent ? (
                  <MonthYearPickerField
                    id={`exp-end-${expIndex}`}
                    label="Data de término"
                    value={exp.endDate}
                    onChange={(value) =>
                      updateExperience(expIndex, { endDate: value })
                    }
                    disabled={isSaving}
                    placeholder="Selecione mês e ano"
                    labelClassName="text-sub-label"
                    className="flex-1"
                    error={experienceEntryErrors?.[expIndex]?.endDate}
                  />
                ) : (
                  <div className="flex-1" />
                )}
              </div>
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
                  onBlur={() => {
                    const capitalized = capitalizeLocation(exp.location);
                    if (capitalized !== exp.location) {
                      updateExperience(expIndex, { location: capitalized });
                    }
                  }}
                  disabled={isSaving}
                  maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
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
                <Textarea
                  autoResize
                  id={`exp-desc-${expIndex}`}
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(expIndex, { description: e.target.value })
                  }
                  disabled={isSaving}
                  maxLength={RESUME_LIMITS.EXPERIENCE_DESCRIPTION_MAX}
                  variant="form"
                  className="w-full"
                  aria-invalid={
                    !!experienceEntryErrors?.[expIndex]?.description
                  }
                />
              </FormField>
            </div>
          </div>
          {expIndex < experience.length - 1 ? (
            <FormSectionSeparator />
          ) : (
            <div className="h-7" />
          )}
        </Fragment>
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

      <Dialog
        open={removeIndex !== null}
        onOpenChange={(open) => !open && setRemoveIndex(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover experiência</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover esta experiência?
          </p>
          <DialogFooter className="flex-row gap-3">
            <Button
              type="button"
              size="brand"
              variant="outline"
              className="gap-1.5"
              onClick={() => setRemoveIndex(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="brand"
              variant="destructiveSolid"
              className="gap-1.5"
              onClick={handleConfirmRemove}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
