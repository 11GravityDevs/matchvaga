"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { DatePickerField } from "@/components/shared/date-picker-field";
import type { ExperienceEntry } from "@/types/resume";
import {
  INPUT_CLASS,
  SECTION_ITEM_LABEL_CLASS,
  SECTION_TITLE_CLASS,
  SUB_LABEL_CLASS,
} from "./verify-content";

interface VerifyExperienceProps {
  experience: ExperienceEntry[];
  updateExperience: (index: number, updates: Partial<ExperienceEntry>) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  isSaving?: boolean;
}

export function VerifyExperience({
  experience,
  updateExperience,
  addExperience,
  removeExperience,
  isSaving,
}: VerifyExperienceProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className={SECTION_TITLE_CLASS}>Experiência</h3>
      {experience.map((exp, expIndex) => (
        <div key={expIndex} className="flex flex-col gap-4">
          {experience.length > 1 && (
            <h4 className={SECTION_ITEM_LABEL_CLASS}>
              Experiência {expIndex + 1}
            </h4>
          )}
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-4">
              <FormField
                label="Empresa"
                htmlFor={`exp-company-${expIndex}`}
                className="flex-1"
              >
                <Input
                  id={`exp-company-${expIndex}`}
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(expIndex, { company: e.target.value })
                  }
                  disabled={isSaving}
                  className={INPUT_CLASS}
                />
              </FormField>
              <FormField
                label="Cargo"
                htmlFor={`exp-job-${expIndex}`}
                className="flex-1"
              >
                <Input
                  id={`exp-job-${expIndex}`}
                  value={exp.jobTitle}
                  onChange={(e) =>
                    updateExperience(expIndex, { jobTitle: e.target.value })
                  }
                  disabled={isSaving}
                  className={INPUT_CLASS}
                />
              </FormField>
            </div>
            <div className="flex gap-3">
              <DatePickerField
                id={`exp-start-${expIndex}`}
                label="Data de início"
                value={exp.startDate}
                onChange={(value) =>
                  updateExperience(expIndex, { startDate: value })
                }
                disabled={isSaving}
                placeholder="Selecione a data de início"
                labelClassName={SUB_LABEL_CLASS}
                className="flex-1"
              />
              <DatePickerField
                id={`exp-end-${expIndex}`}
                label="Data de término"
                value={exp.endDate}
                onChange={(value) =>
                  updateExperience(expIndex, { endDate: value })
                }
                disabled={isSaving}
                placeholder="Selecione a data de término"
                labelClassName={SUB_LABEL_CLASS}
                className="flex-1"
              />
            </div>
            <FormField
              label="Local"
              htmlFor={`exp-location-${expIndex}`}
              labelClassName={SUB_LABEL_CLASS}
            >
              <Input
                id={`exp-location-${expIndex}`}
                value={exp.location}
                onChange={(e) =>
                  updateExperience(expIndex, { location: e.target.value })
                }
                disabled={isSaving}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField
              label="Descrição"
              htmlFor={`exp-desc-${expIndex}`}
              labelClassName={SUB_LABEL_CLASS}
            >
              <textarea
                id={`exp-desc-${expIndex}`}
                value={exp.description}
                onChange={(e) =>
                  updateExperience(expIndex, { description: e.target.value })
                }
                disabled={isSaving}
                className="h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-none transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </FormField>
          </div>
          {experience.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeExperience(expIndex)}
                className="w-fit gap-1.5 bg-destructive text-[13px] text-primary-foreground hover:bg-destructive/90"
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
        onClick={addExperience}
        className="w-fit gap-1.5 bg-accent-brand text-[13px] text-primary-foreground hover:bg-accent-brand-hover"
      >
        <Plus className="h-4 w-4" />
        Adicionar experiência
      </Button>
    </div>
  );
}
