"use server";

import OpenAI from "openai";
import { z } from "zod";

import { gapAnalysisResponseSchema } from "@/lib/ai/config/gap-analysis-schema";
import { jobSkillsResponseSchema } from "@/lib/ai/config/job-skills-schema";
import type { SkillsMatchPair } from "@/lib/ai/config/skills-match-schema";
import { skillsMatchResponseSchema } from "@/lib/ai/config/skills-match-schema";
import { GAP_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/gap-analysis";
import { SKILLS_MATCH_SYSTEM_INSTRUCTION } from "@/lib/ai/prompts/skills-match";
import { logServerError } from "@/lib/logger";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { NOT_JOB_DESCRIPTION_MESSAGE } from "@/utils/job-description";
import { getFlattenedSkills } from "@/utils/resume";

const MODEL = "gpt-4o-mini";

export interface GapAnalysisResult {
  success: true;
  data: {
    score: number;
    matched_skills: string[];
    missing_technical_skills: string[];
    missing_behavioral_skills: string[];
    job_title: string;
    job_company: string;
  };
}

export interface GapAnalysisError {
  success: false;
  error: string;
}

export type GapAnalysisOutput = GapAnalysisResult | GapAnalysisError;

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

function buildUserPrompt(
  resumeData: ResumeData,
  jobDescription: string
): string {
  const skills = getFlattenedSkills(resumeData);
  const resumeSummary = [
    `Candidate: ${resumeData.fullName}`,
    `Summary: ${resumeData.summary}`,
    `Skills: ${skills.join(", ")}`,
    resumeData.languages?.length
      ? `Languages: ${resumeData.languages.join(", ")}`
      : null,
    `Experience: ${resumeData.experience.map((e) => `${e.jobTitle} at ${e.company}: ${e.description}`).join(" | ")}`,
    `Education: ${resumeData.education.map((e) => `${e.course} at ${e.institution}`).join(" | ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `Job description (extract job_title and job_company from this):
${jobDescription}

---
Resume data:
${resumeSummary}

Analyze and return JSON with is_job_description, score, matched_skills, missing_technical_skills, missing_behavioral_skills, job_title, and job_company.`;
}

export async function runGapAnalysisAI(
  resumeData: ResumeData,
  jobDescription: string
): Promise<GapAnalysisOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "OPENAI_API_KEY is not configured" };
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: GAP_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(resumeData, jobDescription) },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    const parsed = JSON.parse(content.trim()) as unknown;
    const validated = gapAnalysisResponseSchema.parse(parsed);

    if (!validated.is_job_description) {
      return { success: false, error: NOT_JOB_DESCRIPTION_MESSAGE };
    }

    return {
      success: true,
      data: {
        score: validated.score,
        matched_skills: validated.matched_skills,
        missing_technical_skills: validated.missing_technical_skills,
        missing_behavioral_skills: validated.missing_behavioral_skills,
        job_title: validated.job_title,
        job_company: validated.job_company,
      },
    };
  } catch (error) {
    logServerError(
      {
        context: "ai",
        operation: "runGapAnalysis",
        message: "Análise de gap (IA) falhou.",
        model: MODEL,
      },
      error
    );
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Não foi possível interpretar a análise.",
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao executar análise." };
  }
}

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
