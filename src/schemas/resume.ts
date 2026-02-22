import { z } from "zod";

export const experienceEntrySchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string(),
  description: z.string(),
  isCurrent: z.boolean().optional(),
});

export const educationEntrySchema = z.object({
  institution: z.string(),
  course: z.string(),
  level: z.string(),
  startDate: z.string(),
  completionDate: z.string(),
  isCurrent: z.boolean().optional(),
});

export const resumeDataSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  location: z.string(),
  phone: z.string(),
  linkedin: z.string(),
  github: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(experienceEntrySchema),
  education: z.array(educationEntrySchema),
});

export type ResumeDataSchema = z.infer<typeof resumeDataSchema>;
