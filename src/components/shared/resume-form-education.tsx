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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { Textarea } from "@/components/ui/textarea";
import { MonthYearPickerField } from "@/components/shared/month-year-picker-field";
import type { EducationEntry } from "@/types/resume";
import type { EducationEntryFieldErrors } from "@/hooks/use-resume-form";
import { FormSectionSeparator } from "@/components/shared/form-section-separator";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";
import { capitalizeTitleCase } from "@/utils/resume";

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
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  const handleConfirmRemove = () => {
    if (removeIndex !== null) {
      removeEducation(removeIndex);
      setRemoveIndex(null);
    }
  };

  return (
    <div
      id="resume-form-education"
      className="flex scroll-mt-6 scroll-mb-6 flex-col"
    >
      <div className="flex flex-col gap-1.5">
        {educationError && (
          <p className="text-sm text-destructive" role="alert">
            {educationError}
          </p>
        )}
      </div>

      {education.map((edu, eduIndex) => (
        <Fragment key={eduIndex}>
          <div
            id={`resume-form-education-entry-${eduIndex}`}
            className="flex scroll-mt-6 scroll-mb-6 flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-section-item-label">
                Formação {eduIndex + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive aria-expanded:text-destructive"
                onClick={() => setRemoveIndex(eduIndex)}
                disabled={isSaving}
                aria-label="Remover formação"
                aria-haspopup="dialog"
                aria-expanded={removeIndex === eduIndex}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
                  onBlur={() => {
                    const capitalized = capitalizeTitleCase(edu.course);
                    if (capitalized !== edu.course) {
                      updateEducation(eduIndex, { course: capitalized });
                    }
                  }}
                  disabled={isSaving}
                  maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
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
                    onBlur={() => {
                      const capitalized = capitalizeTitleCase(edu.institution);
                      if (capitalized !== edu.institution) {
                        updateEducation(eduIndex, { institution: capitalized });
                      }
                    }}
                    disabled={isSaving}
                    maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
                    className={INPUT_CLASS}
                    aria-invalid={
                      !!educationEntryErrors?.[eduIndex]?.institution
                    }
                  />
                </FormField>
              </div>

              <div className="flex gap-8">
                <MonthYearPickerField
                  id={`edu-start-${eduIndex}`}
                  label="Data de início"
                  value={edu.startDate}
                  onChange={(value) =>
                    updateEducation(eduIndex, { startDate: value })
                  }
                  disabled={isSaving}
                  placeholder="Selecione mês e ano"
                  labelClassName="text-sub-label"
                  className="flex-1"
                  error={educationEntryErrors?.[eduIndex]?.startDate}
                />

                {!edu.isCurrent ? (
                  <MonthYearPickerField
                    id={`edu-date-${eduIndex}`}
                    label="Data de conclusão"
                    value={edu.completionDate}
                    onChange={(value) =>
                      updateEducation(eduIndex, { completionDate: value })
                    }
                    disabled={isSaving}
                    placeholder="Selecione mês e ano"
                    labelClassName="text-sub-label"
                    className="flex-1"
                    error={educationEntryErrors?.[eduIndex]?.completionDate}
                  />
                ) : (
                  <div className="flex-1" />
                )}
              </div>

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
              <FormField
                label="Detalhes"
                htmlFor={`edu-desc-${eduIndex}`}
                labelClassName="text-sub-label"
              >
                <Textarea
                  autoResize
                  id={`edu-desc-${eduIndex}`}
                  value={edu.description ?? ""}
                  onChange={(e) =>
                    updateEducation(eduIndex, {
                      description: e.target.value,
                    })
                  }
                  disabled={isSaving}
                  maxLength={RESUME_LIMITS.EDUCATION_DESCRIPTION_MAX}
                  placeholder="Uma conquista por linha"
                  variant="form"
                  className="w-full"
                />
              </FormField>
            </div>
          </div>
          {eduIndex < education.length - 1 ? (
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
          onClick={addEducation}
          disabled={isSaving || education.length >= RESUME_LIMITS.EDUCATION_MAX}
          className="w-fit gap-1.5 text-small"
        >
          <Plus className="h-4 w-4" />
          Adicionar formação
        </Button>
        {education.length >= RESUME_LIMITS.EDUCATION_MAX && (
          <p className="text-small text-muted-foreground">
            Máximo de {RESUME_LIMITS.EDUCATION_MAX} formações
          </p>
        )}
      </div>

      <Dialog
        open={removeIndex !== null}
        onOpenChange={(open) => !open && setRemoveIndex(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover formação</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover esta formação?
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
