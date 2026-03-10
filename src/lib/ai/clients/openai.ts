import { jobSkillsResponseSchema } from "@/lib/ai/config/job-skills-schema";
import type { SkillsMatchPair } from "@/lib/ai/config/skills-match-schema";
import { skillsMatchResponseSchema } from "@/lib/ai/config/skills-match-schema";
import { SKILLS_MATCH_SYSTEM_INSTRUCTION } from "@/lib/ai/prompts/skills-match";
import { logServerError } from "@/lib/logger";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { getFlattenedSkills } from "@/utils/resume";
import OpenAI from "openai";
import { z } from "zod";

const MODEL = "gpt-4o-mini";

const jobSkillsInputSchema = jobSkillsResponseSchema.omit({
  is_job_description: true,
});

export type JobSkillsInput = z.infer<typeof jobSkillsInputSchema>;

export interface MatchSkillsResult {
  success: true;
  data: SkillsMatchPair[];
}

export interface MatchSkillsError {
  success: false;
  error: string;
}

export type MatchSkillsOutput = MatchSkillsResult | MatchSkillsError;

export async function matchJobSkillsToResume(
  jobSkills: JobSkillsInput,
  resumeData: ResumeData
): Promise<MatchSkillsOutput> {
  const jobParsed = jobSkillsInputSchema.safeParse(jobSkills);
  const resumeParsed = resumeDataSchema.safeParse(resumeData);

  if (!jobParsed.success) {
    return { success: false, error: "Habilidades da vaga inválidas." };
  }
  if (!resumeParsed.success) {
    return { success: false, error: "Dados do currículo inválidos." };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "OPENAI_API_KEY is not configured" };
  }

  const jobTerms = [
    ...jobParsed.data.hard_skills.map((s) => s.original_term),
    ...jobParsed.data.soft_skills.map((s) => s.original_term),
  ];

  const resumeTerms = getFlattenedSkills(resumeParsed.data);

  const userPayload = `<job_skills>
  ${jobTerms.map((t) => `- ${t}`).join("\n")}
  </job_skills>

  <resume_skills>
  ${resumeTerms.map((t) => `- ${t}`).join("\n")}
  </resume_skills>

  Respond with a JSON object with a "matches" array of pairs { "job_term", "resume_term" }.`;

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SKILLS_MATCH_SYSTEM_INSTRUCTION },
        { role: "user", content: userPayload },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    const parsed = JSON.parse(content.trim()) as unknown;
    const validated = skillsMatchResponseSchema.parse(parsed);
    return { success: true, data: validated.matches };
  } catch (error) {
    logServerError(
      {
        context: "ai",
        operation: "matchJobSkillsToResume",
        message: "Match de habilidades vaga x currículo falhou.",
        model: MODEL,
      },
      error
    );
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Resposta do modelo inválida.",
      };
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Resposta do modelo não corresponde ao schema esperado.",
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Erro ao processar match de habilidades.",
    };
  }
}
