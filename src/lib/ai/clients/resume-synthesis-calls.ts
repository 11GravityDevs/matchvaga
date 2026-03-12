import type Anthropic from "@anthropic-ai/sdk";

import {
  RESUME_SYNTHESIS_HARD_SKILLS_JSON_SCHEMA,
  RESUME_SYNTHESIS_SUMMARY_JSON_SCHEMA,
} from "@/lib/ai/config/resume-synthesis-json-schema";
import {
  RESUME_SYNTHESIS_HARD_SKILLS_SYSTEM_PROMPT,
  RESUME_SYNTHESIS_SUMMARY_SYSTEM_PROMPT,
} from "@/lib/ai/prompts/resume-synthesis";
import { logServerError } from "@/lib/logger";
import type { SynthesizedFields } from "@/schemas/resume";
import {
  synthesizedHardSkillsResponseSchema,
  synthesizedSummaryResponseSchema,
} from "@/schemas/resume";

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

export async function synthesizeSummary(
  client: InstanceType<typeof Anthropic>,
  params: { summary: string; softSkills: string[]; jobTitle?: string }
): Promise<SummaryResult> {
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
    logServerError(
      {
        context: "ai",
        operation: "synthesizeSummary",
        message: "Síntese de resumo (IA) falhou.",
        model: SONNET_MODEL,
      },
      error
    );

    return { success: false, error: "Erro ao sintetizar resumo." };
  }
}

export async function synthesizeHardSkillsByCategory(
  client: InstanceType<typeof Anthropic>,
  params: { hardSkills: string[] }
): Promise<HardSkillsResult> {
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
    logServerError(
      {
        context: "ai",
        operation: "synthesizeHardSkillsByCategory",
        message: "Síntese de categorias de hard skills (IA) falhou.",
        model: SONNET_MODEL,
      },
      error
    );

    return {
      success: false,
      error: "Erro ao sintetizar categorias de hard skills.",
    };
  }
}
