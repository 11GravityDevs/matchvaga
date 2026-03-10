"use server";

import Anthropic from "@anthropic-ai/sdk";

import { JOB_SKILLS_JSON_SCHEMA } from "@/lib/ai/config/job-skills-json-schema";
import { jobSkillsResponseSchema } from "@/lib/ai/config/job-skills-schema";
import { JOB_SKILLS_EXTRACTION_PROMPT } from "@/lib/ai/prompts/job-skills";
import { RESUME_SYNTHESIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/resume-synthesis";
import { logServerError } from "@/lib/logger";
import {
  synthesizedFieldsSchema,
  type SynthesizedFields,
} from "@/schemas/resume";
import { NOT_JOB_DESCRIPTION_MESSAGE } from "@/utils/job-description";

import extractedMock from "../../../../extracted-mock.json";
import optimizedMock from "../../../../optimized-mock.json";

const MODEL = "claude-haiku-4-5";

export interface SynthesisParams {
  summary: string;
  hardSkills: string[];
  softSkills: string[];
}

export interface SynthesisResult {
  success: true;
  data: SynthesizedFields;
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

const USE_MOCK = process.env.ANTHROPIC_USE_MOCK !== "false";

function stripJsonCodeFences(raw: string): string {
  let s = raw.trim();
  const open = /^```(?:json)?\s*\n?/i;
  const close = /\n?```\s*$/;
  if (open.test(s)) s = s.replace(open, "");
  if (close.test(s)) s = s.replace(close, "");
  return s.trim();
}

function mockToSynthesizedFields(mockData: {
  summary: string;
  hardSkills: string[];
  skillsByCategory?: Array<{ category: string; items: string[] }>;
}): SynthesizedFields {
  const skillsByCategory =
    mockData.skillsByCategory && mockData.skillsByCategory.length > 0
      ? mockData.skillsByCategory
      : [
          {
            category: "Ferramentas de Desenvolvimento",
            items: mockData.hardSkills,
          },
        ];
  return {
    summary: mockData.summary,
    skillsByCategory,
  };
}

export async function synthesizeResumeContent(
  params: SynthesisParams
): Promise<SynthesisOutput> {
  if (USE_MOCK) {
    const raw = (optimizedMock as { success: boolean; data: unknown }).data;
    const data = raw as {
      summary: string;
      hardSkills: string[];
      skillsByCategory?: Array<{ category: string; items: string[] }>;
    };
    const synthesized = mockToSynthesizedFields(data);
    const validated = synthesizedFieldsSchema.parse(synthesized);
    return { success: true, data: validated };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { success: false, error: "ANTHROPIC_API_KEY is not configured" };
  }

  const client = new Anthropic({ apiKey });

  try {
    const userContent = JSON.stringify(params);
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: RESUME_SYNTHESIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const content =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!content) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    const jsonStr = stripJsonCodeFences(content);
    const parsed = JSON.parse(jsonStr) as unknown;
    const validated = synthesizedFieldsSchema.safeParse(parsed);

    if (!validated.success) {
      logServerError(
        {
          context: "ai",
          operation: "synthesizeResumeContent",
          message: "Validação Zod falhou na resposta da síntese.",
        },
        validated.error
      );
      return {
        success: false,
        error: "Não foi possível interpretar a resposta do modelo.",
      };
    }

    return { success: true, data: validated.data };
  } catch (error) {
    logServerError(
      {
        context: "ai",
        operation: "synthesizeResumeContent",
        message: "Síntese de currículo (IA) falhou.",
        model: MODEL,
      },
      error
    );
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Não foi possível interpretar a resposta do modelo.",
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao sintetizar currículo." };
  }
}

export async function extractJobSkills(
  jobDescription: string
): Promise<JobSkillsOutput> {
  if (USE_MOCK) {
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
