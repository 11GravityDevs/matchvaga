"use client";

import { Plus, Trash2 } from "lucide-react";
import { RESUME_LIMITS } from "@/constants/resume";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerField } from "@/components/shared/date-picker-field";
import type { EducationEntry } from "@/types/resume";
import type { EducationEntryFieldErrors } from "@/hooks/use-resume-form";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";

const EDUCATION_LEVELS = [
  "Ensino Fundamental",
  "Ensino Médio",
  "Técnico",
  "Tecnólogo",
  "Bacharelado",
  "Licenciatura",
  "Especialização",
  "MBA",
  "Mestrado",
  "Doutorado",
] as const;

interface ResumeFormEducationProps {
  education: EducationEntry[];
  updateEducation: (index: number, updates: Partial<EducationEntry>) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
  isSaving?: boolean;
  educationError?: string;
  educationEntryErrors?: EducationEntryFieldErrors[];
}

export function ResumeFormEducation({
  education,
  updateEducation,
  addEducation,
  removeEducation,
  isSaving,
  educationError,
  educationEntryErrors,
}: ResumeFormEducationProps) {
  const hasCurrentEducation = education.some((edu) => edu.isCurrent);

  return (
    <div
      id="resume-form-education"
      className="flex scroll-mt-6 scroll-mb-6 flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="text-section-title">
          <span className="inline-flex items-baseline gap-1">
            Formação
            <span className="align-baseline text-small font-normal text-muted-foreground">
              (opcional)
            </span>
          </span>
        </h3>
        {educationError && (
          <p className="text-sm text-destructive" role="alert">
            {educationError}
          </p>
        )}
      </div>
      {education.map((edu, eduIndex) => (
        <div
          key={eduIndex}
          id={`resume-form-education-entry-${eduIndex}`}
          className="flex scroll-mt-6 scroll-mb-6 flex-col gap-4"
        >
          {education.length > 1 && (
            <h4 className="text-section-item-label">Formação {eduIndex + 1}</h4>
          )}
          <div className="flex flex-col gap-2.5">
            <FormField
              label="Curso"
              htmlFor={`edu-course-${eduIndex}`}
              labelClassName="text-sub-label"
              error={educationEntryErrors?.[eduIndex]?.course}
            >
              <Input
                id={`edu-course-${eduIndex}`}
                value={edu.course}
                onChange={(e) =>
                  updateEducation(eduIndex, { course: e.target.value })
                }
                disabled={isSaving}
                className={INPUT_CLASS}
                aria-invalid={!!educationEntryErrors?.[eduIndex]?.course}
              />
            </FormField>

            <div className="flex gap-8">
              <FormField
                label="Nível"
                htmlFor={`edu-level-${eduIndex}`}
                className="flex-1"
                labelClassName="text-sub-label"
                error={educationEntryErrors?.[eduIndex]?.level}
              >
                <Select
                  value={edu.level || ""}
                  onValueChange={(value) =>
                    updateEducation(eduIndex, { level: value })
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger
                    id={`edu-level-${eduIndex}`}
                    className={`${INPUT_CLASS} w-full`}
                    aria-invalid={!!educationEntryErrors?.[eduIndex]?.level}
                  >
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                    {edu.level &&
                      !EDUCATION_LEVELS.includes(
                        edu.level as (typeof EDUCATION_LEVELS)[number]
                      ) && (
                        <SelectItem key={edu.level} value={edu.level}>
                          {edu.level}
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Instituição"
                htmlFor={`edu-inst-${eduIndex}`}
                className="flex-1"
                labelClassName="text-sub-label"
                error={educationEntryErrors?.[eduIndex]?.institution}
              >
                <Input
                  id={`edu-inst-${eduIndex}`}
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(eduIndex, { institution: e.target.value })
                  }
                  disabled={isSaving}
                  className={INPUT_CLASS}
                  aria-invalid={!!educationEntryErrors?.[eduIndex]?.institution}
                />
              </FormField>
            </div>

            <div className="flex gap-8">
              <DatePickerField
                id={`edu-start-${eduIndex}`}
                label="Data de início"
                value={edu.startDate}
                onChange={(value) =>
                  updateEducation(eduIndex, { startDate: value })
                }
                disabled={isSaving}
                placeholder="Selecione a data de início"
                labelClassName="text-sub-label"
                className="flex-1"
                error={educationEntryErrors?.[eduIndex]?.startDate}
              />

              {!edu.isCurrent ? (
                <DatePickerField
                  id={`edu-date-${eduIndex}`}
                  label="Data de conclusão"
                  value={edu.completionDate}
                  onChange={(value) =>
                    updateEducation(eduIndex, { completionDate: value })
                  }
                  disabled={isSaving}
                  placeholder="Selecione a data de conclusão"
                  labelClassName="text-sub-label"
                  className="flex-1"
                  error={educationEntryErrors?.[eduIndex]?.completionDate}
                />
              ) : (
                <div className="flex-1" />
              )}
            </div>

            {(edu.isCurrent || !hasCurrentEducation) && (
              <label className="flex cursor-pointer items-center gap-1 self-start">
                <Checkbox
                  className="cursor-pointer border-2 border-accent-brand data-[state=checked]:border-accent-brand data-[state=checked]:bg-accent-brand"
                  checked={edu.isCurrent ?? false}
                  onCheckedChange={(checked) =>
                    updateEducation(eduIndex, {
                      isCurrent: checked === true,
                      ...(checked === true ? { completionDate: "" } : {}),
                    })
                  }
                  disabled={isSaving}
                />
                <span className="text-small font-medium">
                  Atualmente estudo aqui
                </span>
              </label>
            )}
            <FormField
              label="Detalhes"
              htmlFor={`edu-desc-${eduIndex}`}
              labelClassName="text-sub-label"
            >
              <Textarea
                id={`edu-desc-${eduIndex}`}
                value={edu.description ?? ""}
                onChange={(e) =>
                  updateEducation(eduIndex, {
                    description: e.target.value,
                  })
                }
                disabled={isSaving}
                placeholder="Uma conquista por linha"
                variant="form"
                className="h-32 w-full resize-none"
              />
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructiveSolid"
              size="sm"
              onClick={() => removeEducation(eduIndex)}
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
          onClick={addEducation}
          disabled={isSaving || education.length >= RESUME_LIMITS.EDUCATION_MAX}
          className="w-fit gap-1.5 text-small"
        >
          <Plus className="h-4 w-4" />
          Adicionar formação
        </Button>
        {education.length >= RESUME_LIMITS.EDUCATION_MAX && (
          <p className="text-small text-muted-foreground">
            Máximo de {RESUME_LIMITS.EDUCATION_MAX} formações.
          </p>
        )}
      </div>
    </div>
  );
}
