import { z } from "zod";

export const gapAnalysisResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  matched_skills: z.array(z.string()),
  missing_technical_skills: z.array(z.string()),
  missing_behavioral_skills: z.array(z.string()),
  job_title: z.string(),
  job_company: z.string(),
});

export type GapAnalysisResponse = z.infer<typeof gapAnalysisResponseSchema>;
