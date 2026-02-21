"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { DatePickerField } from "@/components/shared/date-picker-field";
import type { EducationEntry } from "@/types/resume";
import {
  INPUT_CLASS,
  SECTION_ITEM_LABEL_CLASS,
  SECTION_TITLE_CLASS,
  SUB_LABEL_CLASS,
} from "./verify-content";

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

interface VerifyEducationProps {
  education: EducationEntry[];
  updateEducation: (index: number, updates: Partial<EducationEntry>) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
  isSaving?: boolean;
}

export function VerifyEducation({
  education,
  updateEducation,
  addEducation,
  removeEducation,
  isSaving,
}: VerifyEducationProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className={SECTION_TITLE_CLASS}>Formação</h3>
      {education.map((edu, eduIndex) => (
        <div key={eduIndex} className="flex flex-col gap-4">
          {education.length > 1 && (
            <h4 className={SECTION_ITEM_LABEL_CLASS}>
              Formação {eduIndex + 1}
            </h4>
          )}
          <div className="flex flex-col gap-2.5">
            <FormField
              label="Curso"
              htmlFor={`edu-course-${eduIndex}`}
              labelClassName={SUB_LABEL_CLASS}
            >
              <Input
                id={`edu-course-${eduIndex}`}
                value={edu.course}
                onChange={(e) =>
                  updateEducation(eduIndex, { course: e.target.value })
                }
                disabled={isSaving}
                className={INPUT_CLASS}
              />
            </FormField>

            <div className="flex gap-3">
              <FormField
                label="Nível"
                htmlFor={`edu-level-${eduIndex}`}
                className="flex-1"
                labelClassName={SUB_LABEL_CLASS}
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
                labelClassName={SUB_LABEL_CLASS}
              >
                <Input
                  id={`edu-inst-${eduIndex}`}
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(eduIndex, { institution: e.target.value })
                  }
                  disabled={isSaving}
                  className={INPUT_CLASS}
                />
              </FormField>
            </div>

            <div className="flex gap-3">
              <DatePickerField
                id={`edu-start-${eduIndex}`}
                label="Data de início"
                value={edu.startDate}
                onChange={(value) =>
                  updateEducation(eduIndex, { startDate: value })
                }
                disabled={isSaving}
                placeholder="Selecione a data de início"
                labelClassName={SUB_LABEL_CLASS}
                className="flex-1"
              />
              <DatePickerField
                id={`edu-date-${eduIndex}`}
                label="Data de conclusão"
                value={edu.completionDate}
                onChange={(value) =>
                  updateEducation(eduIndex, { completionDate: value })
                }
                disabled={isSaving}
                placeholder="Selecione a data de conclusão"
                labelClassName={SUB_LABEL_CLASS}
                className="flex-1"
              />
            </div>
          </div>
          {education.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeEducation(eduIndex)}
                className="w-fit gap-1.5 bg-destructive text-[13px] text-white hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        onClick={addEducation}
        className="w-fit gap-1.5 bg-accent-brand text-[13px] text-white hover:bg-accent-brand/90"
      >
        <Plus className="h-4 w-4" />
        Adicionar formação
      </Button>
    </div>
  );
}
