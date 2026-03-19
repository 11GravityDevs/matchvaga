import { z } from "zod";

import { RESUME_LIMITS } from "@/constants/resume";

function truncateToMax(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max);
}

const experienceDescriptionItemSchema = z.object({
  id: z.string(),
  description: z
    .string()
    .transform((s) =>
      truncateToMax(s, RESUME_LIMITS.EXPERIENCE_DESCRIPTION_MAX)
    ),
});

const educationDescriptionItemSchema = z.object({
  id: z.string(),
  description: z
    .string()
    .transform((s) =>
      truncateToMax(s, RESUME_LIMITS.EDUCATION_DESCRIPTION_MAX)
    ),
});

export const refineResumeTextsResponseZodSchema = z.object({
  summary: z
    .string()
    .transform((s) => truncateToMax(s, RESUME_LIMITS.SUMMARY_MAX)),
  experienceDescriptions: z.array(experienceDescriptionItemSchema),
  educationDescriptions: z.array(educationDescriptionItemSchema),
});

export type RefineResumeTextsResponse = z.infer<
  typeof refineResumeTextsResponseZodSchema
>;

const experienceDescriptionItemGeminiSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    description: { type: "string" },
  },
  required: ["id", "description"],
};

const educationDescriptionItemGeminiSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    description: { type: "string" },
  },
  required: ["id", "description"],
};

export const refineResumeTextsResponseSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    experienceDescriptions: {
      type: "array",
      items: experienceDescriptionItemGeminiSchema,
    },
    educationDescriptions: {
      type: "array",
      items: educationDescriptionItemGeminiSchema,
    },
  },
  required: ["summary", "experienceDescriptions", "educationDescriptions"],
} as const;
