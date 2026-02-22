"use server";

import OpenAI from "openai";

import { gapAnalysisResponseSchema } from "@/lib/ai/config/gap-analysis-schema";
import { GAP_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/gap-analysis";
import type { ResumeData } from "@/types/resume";

const MODEL = "gpt-4o-mini";

export interface GapAnalysisResult {
  success: true;
  data: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
  };
}

export interface GapAnalysisError {
  success: false;
  error: string;
}

export type GapAnalysisOutput = GapAnalysisResult | GapAnalysisError;

function buildUserPrompt(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string }
): string {
  const resumeSummary = [
    `Candidate: ${resumeData.fullName}`,
    `Summary: ${resumeData.summary}`,
    `Skills: ${resumeData.skills.join(", ")}`,
    `Experience: ${resumeData.experience.map((e) => `${e.jobTitle} at ${e.company}: ${e.description}`).join(" | ")}`,
    `Education: ${resumeData.education.map((e) => `${e.course} at ${e.institution}`).join(" | ")}`,
  ].join("\n");

  return `Job: ${job.title} at ${job.company}

Job description:
${job.rawText}

---
Resume data:
${resumeSummary}

Analyze and return JSON with score, matched_skills, and missing_skills.`;
}

export async function runGapAnalysisAI(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string }
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
        { role: "user", content: buildUserPrompt(resumeData, job) },
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
        missing_skills: validated.missing_skills,
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
