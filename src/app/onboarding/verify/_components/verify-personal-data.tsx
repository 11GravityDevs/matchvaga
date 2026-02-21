"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import type { ResumeData } from "@/types/resume";
import { INPUT_CLASS, SECTION_TITLE_CLASS } from "./verify-content";

interface VerifyPersonalDataProps {
  data: Pick<
    ResumeData,
    "fullName" | "email" | "location" | "phone" | "linkedin" | "github"
  >;
  updateField: <K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) => void;
  isSaving?: boolean;
}

export function VerifyPersonalData({
  data,
  updateField,
  isSaving,
}: VerifyPersonalDataProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className={SECTION_TITLE_CLASS}>Dados pessoais</h3>
      <div className="flex gap-4">
        <FormField label="Nome completo" htmlFor="fullName" className="flex-1">
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField label="E-mail" htmlFor="email" className="flex-1">
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
          />
        </FormField>
      </div>
      <div className="flex gap-4">
        <FormField label="Local" htmlFor="location" className="flex-1">
          <Input
            id="location"
            value={data.location}
            onChange={(e) => updateField("location", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField label="Telefone" htmlFor="phone" className="flex-1">
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            disabled={isSaving}
            className={INPUT_CLASS}
          />
        </FormField>
      </div>
      <div className="flex gap-4">
        <FormField
          label="LinkedIn (opcional)"
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
          label="GitHub (opcional)"
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
