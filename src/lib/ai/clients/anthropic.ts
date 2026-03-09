"use server";

import Anthropic from "@anthropic-ai/sdk";

import { JOB_SKILLS_JSON_SCHEMA } from "@/lib/ai/config/job-skills-json-schema";
import { jobSkillsResponseSchema } from "@/lib/ai/config/job-skills-schema";
import { JOB_SKILLS_EXTRACTION_PROMPT } from "@/lib/ai/prompts/job-skills";
import { SYNTHESIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/synthesis";
import { normalizeAIResumeData } from "@/lib/ai/utils/normalize-resume";
import { logServerError } from "@/lib/logger";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { NOT_JOB_DESCRIPTION_MESSAGE } from "@/utils/job-description";

import extractedMock from "../../../../extracted-mock.json";
import optimizedMock from "../../../../optimized-mock.json";

const MODEL = "claude-haiku-4-5";

export interface SynthesisResult {
  success: true;
  data: ResumeData;
}

export interface SynthesisError {
  success: false;
  error: string;
}

export type SynthesisOutput = SynthesisResult | SynthesisError;

export interface JobSkillsResult {
  success: true;
  data: {
    hard_skills: Array<{
      name: string;
      original_term: string;
      type: "required" | "differential";
    }>;
    soft_skills: Array<{
      name: string;
      original_term: string;
      type: "required" | "differential";
    }>;
    job_title: string;
    job_company: string;
  };
}

export interface JobSkillsError {
  success: false;
  error: string;
}

export type JobSkillsOutput = JobSkillsResult | JobSkillsError;

function buildMissingSkillsBlock(
  missing:
    | {
        hard: string[];
        soft: string[];
      }
    | undefined
): string {
  if (!missing) {
    return "Missing skills: none — do not add any skills beyond the matched skills list above.";
  }
  const { hard, soft } = missing;
  const hasHard = hard.length > 0;
  const hasSoft = soft.length > 0;

  if (!hasHard && !hasSoft) {
    return "Missing skills: none — do not add any skills beyond the matched skills list above.";
  }

  const lines: string[] = [];

  if (hasHard) {
    lines.push(
      `Missing hard skills (weave in where truthful): ${hard.join(", ")}`
    );
  }

  if (hasSoft) {
    lines.push(
      `Missing soft skills (weave in where truthful): ${soft.join(", ")}`
    );
  }

  return lines.join("\n");
}

function buildUserPrompt(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: { hard: string[]; soft: string[] } | undefined
): string {
  return `Job: ${job.title} at ${job.company}

Job description:
${job.rawText}

---
Matched skills (emphasize these): ${matchedSkills.join(", ") || "none"}
${buildMissingSkillsBlock(missingSkills)}

---
Current resume (JSON):
${JSON.stringify(resumeData, null, 2)}

Return the optimized resume as JSON. Include skillsByCategory (array of { category, items }), skills (flat array), and all other fields. Experience and education descriptions: one bullet per line. Output only valid JSON.`;
}

const USE_SYNTHESIS_MOCK = true;

export async function synthesizeResumeContent(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: { hard: string[]; soft: string[] } | undefined
): Promise<SynthesisOutput> {
  if (USE_SYNTHESIS_MOCK) {
    const data = (optimizedMock as { success: boolean; data: unknown }).data;
    const validated = resumeDataSchema.parse(data);
    return { success: true, data: validated };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { success: false, error: "ANTHROPIC_API_KEY is not configured" };
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYNTHESIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(
            resumeData,
            job,
            matchedSkills,
            missingSkills
          ),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const content =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!content) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    const trimmed = content.trim();
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
    const parsed = JSON.parse(jsonStr) as unknown;
    const normalized = normalizeAIResumeData(parsed);
    const validated = resumeDataSchema.parse(normalized);

    return { success: true, data: validated };
  } catch (error) {
    logServerError(
      {
        context: "ai",
        operation: "synthesizeResumeContent",
        message: "Síntese de conteúdo do currículo para a vaga falhou.",
        model: MODEL,
      },
      error
    );
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Não foi possível interpretar o documento.",
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao gerar documento." };
  }
}

const USE_JOB_SKILLS_MOCK = true;

export async function extractJobSkills(
  jobDescription: string
): Promise<JobSkillsOutput> {
  if (USE_JOB_SKILLS_MOCK) {
    const data = (extractedMock as { success: boolean; data: unknown }).data;
    const validated = jobSkillsResponseSchema.parse(data);
    return { success: true, data: validated };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { success: false, error: "ANTHROPIC_API_KEY is not configured" };
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: JOB_SKILLS_EXTRACTION_PROMPT,
      messages: [{ role: "user", content: jobDescription }],
      output_config: {
        format: {
          type: "json_schema",
          schema: JOB_SKILLS_JSON_SCHEMA,
        },
      },
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const content =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!content) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    const parsed = JSON.parse(content) as unknown;
    const validated = jobSkillsResponseSchema.safeParse(parsed);

    if (!validated.success) {
      logServerError(
        {
          context: "ai",
          operation: "extractJobSkills",
          message: "Validação Zod falhou após Structured Outputs.",
        },
        validated.error
      );
      return {
        success: false,
        error: "Não foi possível interpretar a resposta.",
      };
    }

    if (!validated.data.is_job_description) {
      return { success: false, error: NOT_JOB_DESCRIPTION_MESSAGE };
    }

    return {
      success: true,
      data: {
        hard_skills: validated.data.hard_skills,
        soft_skills: validated.data.soft_skills,
        job_title: validated.data.job_title,
        job_company: validated.data.job_company,
      },
    };
  } catch (error) {
    logServerError(
      {
        context: "ai",
        operation: "extractJobSkills",
        message: "Extração de skills da vaga (IA) falhou.",
        model: MODEL,
      },
      error
    );
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Não foi possível interpretar a resposta.",
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao extrair skills da vaga." };
  }
}
