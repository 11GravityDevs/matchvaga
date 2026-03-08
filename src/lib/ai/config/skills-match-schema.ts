import { z } from "zod";

export const skillsMatchPairSchema = z.object({
  job_term: z.string(),
  resume_term: z.string(),
});

export type SkillsMatchPair = z.infer<typeof skillsMatchPairSchema>;

export const skillsMatchResponseSchema = z.object({
  matches: z.array(skillsMatchPairSchema),
});
