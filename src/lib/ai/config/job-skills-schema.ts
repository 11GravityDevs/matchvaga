import { z } from "zod";

const skillSchema = z.object({
  name: z
    .string()
    .describe(
      "Normalized label for display, e.g. 'Colaboração', 'Testes unitários'"
    ),
  original_term: z
    .string()
    .describe(
      "Exact phrase or word as it appeared in the job description, for ATS matching"
    ),
  type: z
    .enum(["required", "differential"])
    .describe("Whether the skill is required or a differential"),
});

export const jobSkillsResponseSchema = z.object({
  hard_skills: z.array(skillSchema),
  soft_skills: z.array(skillSchema),
});
