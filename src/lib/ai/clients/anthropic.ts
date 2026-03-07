"use server";

import Anthropic from "@anthropic-ai/sdk";

import { JOB_SKILLS_JSON_SCHEMA } from "@/lib/ai/config/job-skills-json-schema";
import { jobSkillsResponseSchema } from "@/lib/ai/config/job-skills-schema";
import { JOB_SKILLS_EXTRACTION_PROMPT } from "@/lib/ai/prompts/job-skills";
import { normalizeAIResumeData } from "@/lib/ai/utils/normalize-resume";
import { logServerError } from "@/lib/logger";
import { SYNTHESIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/synthesis";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";

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
        technical: string[];
        behavioral: string[];
      }
    | undefined
): string {
  if (!missing) {
    return "Missing skills: none — do not add any skills beyond the matched skills list above.";
  }
  const { technical, behavioral } = missing;
  const hasTechnical = technical.length > 0;
  const hasBehavioral = behavioral.length > 0;

  if (!hasTechnical && !hasBehavioral) {
    return "Missing skills: none — do not add any skills beyond the matched skills list above.";
  }

  const lines: string[] = [];

  if (hasTechnical) {
    lines.push(
      `Missing technical skills (weave in where truthful): ${technical.join(", ")}`
    );
  }

  if (hasBehavioral) {
    lines.push(
      `Missing behavioral skills (weave in where truthful): ${behavioral.join(", ")}`
    );
  }

  return lines.join("\n");
}

function buildUserPrompt(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: { technical: string[]; behavioral: string[] } | undefined
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

export async function synthesizeOptimizedResume(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: { technical: string[]; behavioral: string[] } | undefined
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
        operation: "synthesizeOptimizedResume",
        message: "Síntese de currículo otimizado falhou.",
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

export async function extractJobSkills(
  jobDescription: string
): Promise<JobSkillsOutput> {
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

    return {
      success: true,
      data: {
        hard_skills: validated.data.hard_skills,
        soft_skills: validated.data.soft_skills,
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
