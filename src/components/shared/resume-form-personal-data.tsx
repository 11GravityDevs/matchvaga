"use client";

import { RESUME_LIMITS } from "@/constants/resume";
import { PHONE_DDI_OPTIONS } from "@/constants/phone";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import type { ResumeData } from "@/types/resume";
import type { ResumeValidationErrors } from "@/hooks/use-resume-form";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";
import { formatPhoneBr } from "@/utils/resume";

interface ResumeFormPersonalDataProps {
  data: Pick<
    ResumeData,
    | "fullName"
    | "email"
    | "location"
    | "phoneDdi"
    | "phone"
    | "linkedin"
    | "github"
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
        <div
          id="resume-form-fullName"
          className="flex-1 scroll-mt-6 scroll-mb-6"
        >
          <FormField
            label="Nome completo"
            htmlFor="fullName"
            error={validationErrors?.fullName}
          >
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              disabled={isSaving}
              maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
              className={INPUT_CLASS}
              aria-invalid={!!validationErrors?.fullName}
            />
          </FormField>
        </div>
        <div id="resume-form-email" className="flex-1 scroll-mt-6 scroll-mb-6">
          <FormField
            label="E-mail"
            htmlFor="email"
            error={validationErrors?.email}
          >
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateField("email", e.target.value)}
              disabled={isSaving}
              maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
              className={INPUT_CLASS}
              aria-invalid={!!validationErrors?.email}
            />
          </FormField>
        </div>
      </div>
      <div className="flex gap-8">
        <div
          id="resume-form-location"
          className="flex-1 scroll-mt-6 scroll-mb-6"
        >
          <FormField
            label="Local"
            htmlFor="location"
            error={validationErrors?.location}
          >
            <Input
              id="location"
              value={data.location}
              onChange={(e) => updateField("location", e.target.value)}
              disabled={isSaving}
              maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
              className={INPUT_CLASS}
              aria-invalid={!!validationErrors?.location}
            />
          </FormField>
        </div>
        <div id="resume-form-phone" className="flex-1 scroll-mt-6 scroll-mb-6">
          <FormField
            label="Telefone"
            htmlFor="phone"
            error={validationErrors?.phoneDdi ?? validationErrors?.phone}
          >
            <div className="flex items-center gap-2">
              <Select
                value={data.phoneDdi}
                onValueChange={(value) => updateField("phoneDdi", value)}
                disabled={isSaving}
              >
                <SelectTrigger
                  className={INPUT_CLASS}
                  aria-invalid={!!validationErrors?.phone}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHONE_DDI_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    data.phoneDdi === "+55"
                      ? formatPhoneBr(e.target.value)
                      : e.target.value
                  )
                }
                disabled={isSaving}
                maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
                className={INPUT_CLASS}
                placeholder={
                  data.phoneDdi === "+55" ? "(11) 99999-9999" : undefined
                }
                aria-invalid={!!validationErrors?.phone}
              />
            </div>
          </FormField>
        </div>
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
            maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
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
            maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
            className={INPUT_CLASS}
          />
        </FormField>
      </div>
    </div>
  );
}
