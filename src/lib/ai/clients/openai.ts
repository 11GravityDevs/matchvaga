"use server";

import OpenAI from "openai";

import { gapAnalysisResponseSchema } from "@/lib/ai/config/gap-analysis-schema";
import { GAP_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/gap-analysis";
import type { ResumeData } from "@/types/resume";
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

Analyze and return JSON with score, matched_skills, missing_technical_skills, missing_behavioral_skills, job_title, and job_company.`;
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
