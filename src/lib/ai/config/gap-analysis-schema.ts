import { z } from "zod";

export const gapAnalysisResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
});

export type GapAnalysisResponse = z.infer<typeof gapAnalysisResponseSchema>;
