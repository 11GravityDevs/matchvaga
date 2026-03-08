"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import type { ResumeValidationErrors } from "@/hooks/use-resume-form";
import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
} from "@/types/resume";
import { getResumeValidationErrors } from "@/utils/resume-validation";

type TopLevelErrorKey = keyof Pick<
  ResumeValidationErrors,
  | "fullName"
  | "email"
  | "location"
  | "phone"
  | "summary"
  | "hardSkills"
  | "softSkills"
>;

const TOP_LEVEL_ERROR_KEYS: readonly TopLevelErrorKey[] = [
  "fullName",
  "email",
  "location",
  "phone",
  "summary",
  "hardSkills",
  "softSkills",
];

function hasAnyErrorEntries<T extends object>(entries: T[]): boolean {
  return entries.some((entry) => Object.keys(entry).length > 0);
}

export interface UseResumeFormValidationOptions {
  updateField: <K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) => void;
  updateExperience: (index: number, updates: Partial<ExperienceEntry>) => void;
  removeExperience: (index: number) => void;
  updateEducation: (index: number, updates: Partial<EducationEntry>) => void;
  removeEducation: (index: number) => void;
  handleSummaryChange: (value: string) => void;
}

export interface UseResumeFormValidationReturn {
  validationErrors: ResumeValidationErrors | null;
  setValidationErrors: Dispatch<SetStateAction<ResumeValidationErrors | null>>;
  scrollToFirstError: boolean;
  wrappedUpdateField: <K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) => void;
  wrappedUpdateExperience: (
    index: number,
    updates: Partial<ExperienceEntry>
  ) => void;
  wrappedRemoveExperience: (index: number) => void;
  wrappedUpdateEducation: (
    index: number,
    updates: Partial<EducationEntry>
  ) => void;
  wrappedRemoveEducation: (index: number) => void;
  wrappedHandleSummaryChange: (value: string) => void;
  validateBeforeSubmit: (data: ResumeData) => boolean;
  setFormError: (message: string) => void;
}

export function useResumeFormValidation({
  updateField,
  updateExperience,
  removeExperience,
  updateEducation,
  removeEducation,
  handleSummaryChange,
}: UseResumeFormValidationOptions): UseResumeFormValidationReturn {
  const [validationErrors, setValidationErrors] =
    useState<ResumeValidationErrors | null>(null);
  const [scrollToFirstError, setScrollToFirstError] = useState(false);

  useEffect(() => {
    if (!scrollToFirstError) return;
    const timer = setTimeout(() => setScrollToFirstError(false), 500);
    return () => clearTimeout(timer);
  }, [scrollToFirstError]);

  function triggerScrollToFirstError() {
    setScrollToFirstError(true);
  }

  function clearTopLevelError(key: TopLevelErrorKey) {
    setValidationErrors((previousErrors: ResumeValidationErrors | null) => {
      if (!previousErrors) return null;
      const nextErrors = { ...previousErrors };
      delete nextErrors[key];
      return Object.keys(nextErrors).length > 0 ? nextErrors : null;
    });
  }

  function clearExperienceEntryErrors(
    index: number,
    keys: (keyof ExperienceEntry)[]
  ) {
    setValidationErrors((previousErrors: ResumeValidationErrors | null) => {
      if (!previousErrors?.experienceEntryErrors?.[index])
        return previousErrors;

      const entryErrors = { ...previousErrors.experienceEntryErrors[index] };
      for (const key of keys) {
        delete entryErrors[key];
      }

      const nextEntryErrors = [...previousErrors.experienceEntryErrors];
      nextEntryErrors[index] = entryErrors;

      const nextErrors: ResumeValidationErrors = { ...previousErrors };
      nextErrors.experienceEntryErrors = hasAnyErrorEntries(nextEntryErrors)
        ? nextEntryErrors
        : undefined;
      delete nextErrors.experience;

      return nextErrors;
    });
  }

  function clearEducationEntryErrors(
    index: number,
    keys: (keyof EducationEntry)[]
  ) {
    setValidationErrors((previousErrors: ResumeValidationErrors | null) => {
      if (!previousErrors?.educationEntryErrors?.[index]) return previousErrors;

      const entryErrors = { ...previousErrors.educationEntryErrors[index] };
      for (const key of keys) {
        delete entryErrors[key];
      }

      const nextEntryErrors = [...previousErrors.educationEntryErrors];
      nextEntryErrors[index] = entryErrors;

      const nextErrors: ResumeValidationErrors = { ...previousErrors };
      nextErrors.educationEntryErrors = hasAnyErrorEntries(nextEntryErrors)
        ? nextEntryErrors
        : undefined;
      delete nextErrors.education;

      return nextErrors;
    });
  }

  function reindexExperienceEntryErrorsAfterRemove(removedIndex: number) {
    setValidationErrors((previousErrors: ResumeValidationErrors | null) => {
      if (!previousErrors?.experienceEntryErrors?.length) return previousErrors;

      const nextEntryErrors = previousErrors.experienceEntryErrors.filter(
        (_entry, index) => index !== removedIndex
      );
      const nextErrors: ResumeValidationErrors = { ...previousErrors };
      nextErrors.experienceEntryErrors =
        nextEntryErrors.length > 0 ? nextEntryErrors : undefined;
      delete nextErrors.experience;
      return nextErrors;
    });
  }

  function reindexEducationEntryErrorsAfterRemove(removedIndex: number) {
    setValidationErrors((previousErrors: ResumeValidationErrors | null) => {
      if (!previousErrors?.educationEntryErrors?.length) return previousErrors;

      const nextEntryErrors = previousErrors.educationEntryErrors.filter(
        (_entry, index) => index !== removedIndex
      );
      const nextErrors: ResumeValidationErrors = { ...previousErrors };
      nextErrors.educationEntryErrors =
        nextEntryErrors.length > 0 ? nextEntryErrors : undefined;
      delete nextErrors.education;
      return nextErrors;
    });
  }

  function wrappedUpdateField<K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) {
    if (TOP_LEVEL_ERROR_KEYS.includes(key as TopLevelErrorKey)) {
      clearTopLevelError(key as TopLevelErrorKey);
    }
    updateField(key, value);
  }

  function wrappedHandleSummaryChange(value: string) {
    clearTopLevelError("summary");
    handleSummaryChange(value);
  }

  function wrappedUpdateExperience(
    index: number,
    updates: Partial<ExperienceEntry>
  ) {
    const updatedKeys = Object.keys(updates) as (keyof ExperienceEntry)[];
    if (updatedKeys.length > 0) {
      clearExperienceEntryErrors(index, updatedKeys);
    }
    updateExperience(index, updates);
  }

  function wrappedRemoveExperience(index: number) {
    reindexExperienceEntryErrorsAfterRemove(index);
    removeExperience(index);
  }

  function wrappedUpdateEducation(
    index: number,
    updates: Partial<EducationEntry>
  ) {
    const updatedKeys = Object.keys(updates) as (keyof EducationEntry)[];
    if (updatedKeys.length > 0) {
      clearEducationEntryErrors(index, updatedKeys);
    }
    updateEducation(index, updates);
  }

  function wrappedRemoveEducation(index: number) {
    reindexEducationEntryErrorsAfterRemove(index);
    removeEducation(index);
  }

  function validateBeforeSubmit(data: ResumeData): boolean {
    const nextErrors = getResumeValidationErrors(data);
    if (nextErrors !== null) {
      setValidationErrors(nextErrors);
      triggerScrollToFirstError();
      return false;
    }

    setValidationErrors(null);
    return true;
  }

  function setFormError(message: string) {
    setValidationErrors({ form: message });
    triggerScrollToFirstError();
  }

  return {
    validationErrors,
    setValidationErrors,
    scrollToFirstError,
    wrappedUpdateField,
    wrappedUpdateExperience,
    wrappedRemoveExperience,
    wrappedUpdateEducation,
    wrappedRemoveEducation,
    wrappedHandleSummaryChange,
    validateBeforeSubmit,
    setFormError,
  };
}
