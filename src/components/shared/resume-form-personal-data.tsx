"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import type { ResumeData } from "@/types/resume";
import type { ResumeValidationErrors } from "@/hooks/use-resume-form";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";

interface ResumeFormPersonalDataProps {
  data: Pick<
    ResumeData,
    "fullName" | "email" | "location" | "phone" | "linkedin" | "github"
  >;
  updateField: <K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) => void;
  isSaving?: boolean;
  validationErrors?: ResumeValidationErrors | null;
}

export function ResumeFormPersonalData({
  data,
  updateField,
  isSaving,
  validationErrors,
}: ResumeFormPersonalDataProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-section-title">Dados pessoais</h3>
      <div className="flex gap-8">
        <FormField
          label="Nome completo"
          htmlFor="fullName"
          className="flex-1"
          error={validationErrors?.fullName}
        >
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
            aria-invalid={!!validationErrors?.fullName}
          />
        </FormField>
        <FormField
          label="E-mail"
          htmlFor="email"
          className="flex-1"
          error={validationErrors?.email}
        >
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
            aria-invalid={!!validationErrors?.email}
          />
        </FormField>
      </div>
      <div className="flex gap-8">
        <FormField
          label="Local"
          htmlFor="location"
          className="flex-1"
          error={validationErrors?.location}
        >
          <Input
            id="location"
            value={data.location}
            onChange={(e) => updateField("location", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
            aria-invalid={!!validationErrors?.location}
          />
        </FormField>
        <FormField
          label="Telefone"
          htmlFor="phone"
          className="flex-1"
          error={validationErrors?.phone}
        >
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
            aria-invalid={!!validationErrors?.phone}
          />
        </FormField>
      </div>
      <div className="flex gap-8">
        <FormField
          label={
            <div className="flex items-baseline gap-0.5">
              LinkedIn
              <span className="align-baseline text-small font-normal text-muted-foreground">
                (opcional)
              </span>
            </div>
          }
          htmlFor="linkedin"
          className="flex-1"
        >
          <Input
            id="linkedin"
            value={data.linkedin}
            onChange={(e) => updateField("linkedin", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField
          label={
            <div className="flex items-baseline gap-0.5">
              GitHub
              <span className="align-baseline text-small font-normal text-muted-foreground">
                (opcional)
              </span>
            </div>
          }
          htmlFor="github"
          className="flex-1"
        >
          <Input
            id="github"
            value={data.github}
            onChange={(e) => updateField("github", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
          />
        </FormField>
      </div>
    </div>
  );
}
