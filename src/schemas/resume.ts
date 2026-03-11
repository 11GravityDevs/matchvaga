import { z } from "zod";

import { RESUME_LIMITS } from "@/constants/resume";

const textField = () =>
  z.string().max(RESUME_LIMITS.TEXT_FIELD_MAX, {
    message: `Máximo de ${RESUME_LIMITS.TEXT_FIELD_MAX} caracteres`,
  });

export const experienceEntrySchema = z.object({
  jobTitle: textField(),
  company: textField(),
  startDate: textField(),
  endDate: textField(),
  location: textField(),
  description: z.string().max(RESUME_LIMITS.EXPERIENCE_DESCRIPTION_MAX, {
    message: `Descrição com no máximo ${RESUME_LIMITS.EXPERIENCE_DESCRIPTION_MAX} caracteres`,
  }),
  isCurrent: z.boolean().optional(),
});

export const educationEntrySchema = z.object({
  institution: textField(),
  course: textField(),
  level: textField(),
  startDate: textField(),
  completionDate: textField(),
  description: z
    .string()
    .max(RESUME_LIMITS.EDUCATION_DESCRIPTION_MAX, {
      message: `Descrição com no máximo ${RESUME_LIMITS.EDUCATION_DESCRIPTION_MAX} caracteres`,
    })
    .optional(),
  isCurrent: z.boolean().optional(),
});

export const skillCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const resumeDataSchema = z.object({
  fullName: textField(),
  email: textField(),
  location: textField(),
  phone: textField(),
  linkedin: textField(),
  github: textField(),
  summary: z.string().max(RESUME_LIMITS.SUMMARY_MAX, {
    message: `Resumo com no máximo ${RESUME_LIMITS.SUMMARY_MAX} caracteres`,
  }),
  hardSkills: z
    .array(z.string().max(RESUME_LIMITS.TEXT_FIELD_MAX))
    .max(RESUME_LIMITS.SKILLS_MAX, {
      message: `Máximo de ${RESUME_LIMITS.SKILLS_MAX} habilidades técnicas`,
    }),
  softSkills: z
    .array(z.string().max(RESUME_LIMITS.TEXT_FIELD_MAX))
    .max(RESUME_LIMITS.SKILLS_MAX, {
      message: `Máximo de ${RESUME_LIMITS.SKILLS_MAX} competências comportamentais`,
    }),
  languages: z
    .array(z.string().max(RESUME_LIMITS.TEXT_FIELD_MAX))
    .max(RESUME_LIMITS.LANGUAGES_MAX, {
      message: `Máximo de ${RESUME_LIMITS.LANGUAGES_MAX} idiomas`,
    })
    .default([]),
  hardSkillsByCategory: z.array(skillCategorySchema).optional(),
  experience: z.array(experienceEntrySchema).max(RESUME_LIMITS.EXPERIENCE_MAX, {
    message: `Máximo de ${RESUME_LIMITS.EXPERIENCE_MAX} experiências`,
  }),
  education: z.array(educationEntrySchema).max(RESUME_LIMITS.EDUCATION_MAX, {
    message: `Máximo de ${RESUME_LIMITS.EDUCATION_MAX} formações`,
  }),
});

export const synthesizedFieldsSchema = z.object({
  summary: z.string().max(RESUME_LIMITS.SUMMARY_MAX, {
    message: `Resumo com no máximo ${RESUME_LIMITS.SUMMARY_MAX} caracteres`,
  }),
  hardSkillsByCategory: z.array(skillCategorySchema),
});

export type SynthesizedFields = z.infer<typeof synthesizedFieldsSchema>;

export const synthesizedSummaryResponseSchema = z.object({
  summary: z.string().max(RESUME_LIMITS.SUMMARY_MAX, {
    message: `Resumo com no máximo ${RESUME_LIMITS.SUMMARY_MAX} caracteres`,
  }),
});

export const synthesizedHardSkillsResponseSchema = z.object({
  hardSkillsByCategory: z.array(skillCategorySchema),
});
