import { getAnthropicClient } from "@/lib/ai/clients/create-client";
import { JOB_SKILLS_JSON_SCHEMA } from "@/lib/ai/config/job-skills-json-schema";
import { jobSkillsResponseSchema } from "@/lib/ai/config/job-skills-schema";
import {
  RESUME_SYNTHESIS_HARD_SKILLS_JSON_SCHEMA,
  RESUME_SYNTHESIS_SUMMARY_JSON_SCHEMA,
} from "@/lib/ai/config/resume-synthesis-json-schema";
import { JOB_SKILLS_EXTRACTION_PROMPT } from "@/lib/ai/prompts/job-skills";
import {
  RESUME_SYNTHESIS_HARD_SKILLS_SYSTEM_PROMPT,
  RESUME_SYNTHESIS_SUMMARY_SYSTEM_PROMPT,
} from "@/lib/ai/prompts/resume-synthesis";
import { handleAiError } from "@/lib/ai/errors";
import { isLanguageSkill } from "@/lib/ai/utils/job-skills";
import { logServerError } from "@/lib/logger";
import {
  synthesizedHardSkillsResponseSchema,
  synthesizedSummaryResponseSchema,
  type SynthesizedFields,
} from "@/schemas/resume";
import { NOT_JOB_DESCRIPTION_MESSAGE } from "@/utils/job-description";

const HAIKU_MODEL = "claude-haiku-4-5";
const SONNET_MODEL = "claude-sonnet-4-6";

export type SummaryResult =
  | { success: true; data: { summary: string } }
  | { success: false; error: string };

export type HardSkillsResult =
  | {
      success: true;
      data: {
        hardSkillsByCategory: SynthesizedFields["hardSkillsByCategory"];
      };
    }
  | { success: false; error: string };

export async function synthesizeSummary(params: {
  summary: string;
  softSkills: string[];
  jobTitle?: string;
}): Promise<SummaryResult> {
  const result = getAnthropicClient();
  if (!result.ok) return { success: false, error: result.error };
  const { client } = result;
  try {
    const userContent = JSON.stringify(params);
    const message = await client.messages.create({
      model: SONNET_MODEL,
      max_tokens: 2000,
      system: RESUME_SYNTHESIS_SUMMARY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      output_config: {
        effort: "high",
        format: {
          type: "json_schema",
          schema: RESUME_SYNTHESIS_SUMMARY_JSON_SCHEMA,
        },
      },
      temperature: 0.25,
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const content =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!content) {
      return { success: false, error: "Resposta vazia do modelo (resumo)." };
    }

    const parsed = JSON.parse(content) as unknown;
    const validated = synthesizedSummaryResponseSchema.safeParse(parsed);
    if (!validated.success) {
      logServerError(
        {
          context: "ai",
          operation: "synthesizeSummary",
          message: "Validação Zod falhou na resposta do resumo.",
        },
        validated.error
      );
      return { success: false, error: "Resposta inválida (resumo)." };
    }
    return { success: true, data: { summary: validated.data.summary } };
  } catch (error) {
    return {
      success: false,
      error: handleAiError(error, {
        operation: "synthesizeSummary",
        model: SONNET_MODEL,
      }),
    };
  }
}

export async function synthesizeHardSkillsByCategory(params: {
  hardSkills: string[];
}): Promise<HardSkillsResult> {
  const result = getAnthropicClient();
  if (!result.ok) return { success: false, error: result.error };
  const { client } = result;
  try {
    const userContent = JSON.stringify(params);
    const message = await client.messages.create({
      model: SONNET_MODEL,
      max_tokens: 2000,
      system: RESUME_SYNTHESIS_HARD_SKILLS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      output_config: {
        effort: "high",
        format: {
          type: "json_schema",
          schema: RESUME_SYNTHESIS_HARD_SKILLS_JSON_SCHEMA,
        },
      },
      temperature: 0.4,
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const content =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!content) {
      return {
        success: false,
        error: "Resposta vazia do modelo (categorias).",
      };
    }

    const parsed = JSON.parse(content) as unknown;
    const validated = synthesizedHardSkillsResponseSchema.safeParse(parsed);
    if (!validated.success) {
      logServerError(
        {
          context: "ai",
          operation: "synthesizeHardSkillsByCategory",
          message: "Validação Zod falhou na resposta de categorias.",
        },
        validated.error
      );
      return { success: false, error: "Resposta inválida (categorias)." };
    }
    return {
      success: true,
      data: {
        hardSkillsByCategory: validated.data.hardSkillsByCategory,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: handleAiError(error, {
        operation: "synthesizeHardSkillsByCategory",
        model: SONNET_MODEL,
      }),
    };
  }
}

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

export async function extractJobSkills(
  jobDescription: string
): Promise<JobSkillsOutput> {
  const result = getAnthropicClient();
  if (!result.ok) return { success: false, error: result.error };
  const { client } = result;
  try {
    const message = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 4096,
      system: JOB_SKILLS_EXTRACTION_PROMPT,
      messages: [{ role: "user", content: jobDescription }],
      output_config: {
        format: {
          type: "json_schema",
          schema: JOB_SKILLS_JSON_SCHEMA,
        },
      },
      temperature: 0.2,
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

    const hard_skills = validated.data.hard_skills.filter(
      (s) => !isLanguageSkill(s)
    );
    const soft_skills = validated.data.soft_skills.filter(
      (s) => !isLanguageSkill(s)
    );

    const jobTitle = validated.data.job_title?.trim() || "Não especificado";
    const jobCompany = validated.data.job_company?.trim() || "Não especificado";

    return {
      success: true,
      data: {
        hard_skills,
        soft_skills,
        job_title: jobTitle,
        job_company: jobCompany,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: handleAiError(error, {
        operation: "extractJobSkills",
        model: HAIKU_MODEL,
      }),
    };
  }
}
