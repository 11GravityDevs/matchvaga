"use client";

import { RESUME_LIMITS } from "@/constants/resume";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import type { ResumeData } from "@/types/resume";
import type { ResumeValidationErrors } from "@/hooks/use-resume-form";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";
import { capitalizeLocation, formatPhoneBr } from "@/utils/resume";
import { capitalizeTitleCase } from "@/utils/resume";

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
              onBlur={() => {
                const capitalized = capitalizeTitleCase(data.fullName);
                if (capitalized !== data.fullName) {
                  updateField("fullName", capitalized);
                }
              }}
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
              onBlur={() => {
                const capitalized = capitalizeLocation(data.location);

                if (capitalized !== data.location) {
                  updateField("location", capitalized);
                }
              }}
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
            error={validationErrors?.phone}
          >
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) =>
                updateField("phone", formatPhoneBr(e.target.value))
              }
              disabled={isSaving}
              maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
              className={INPUT_CLASS}
              placeholder="(11) 99999-9999"
              aria-invalid={!!validationErrors?.phone}
            />
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
