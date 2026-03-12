import {
  synthesizeHardSkillsByCategory,
  synthesizeSummary,
} from "@/lib/ai/clients/anthropic";
import { logServerError } from "@/lib/logger";
import {
  synthesizedFieldsSchema,
  type SynthesizedFields,
} from "@/schemas/resume";

export interface SynthesisParams {
  summary: string;
  hardSkills: string[];
  softSkills: string[];
  jobTitle?: string;
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

export async function synthesizeResumeContent(
  params: SynthesisParams
): Promise<SynthesisOutput> {
  const [resultSummary, resultHardSkills] = await Promise.all([
    synthesizeSummary({
      summary: params.summary,
      softSkills: params.softSkills,
      jobTitle: params.jobTitle,
    }),
    synthesizeHardSkillsByCategory({ hardSkills: params.hardSkills }),
  ]);

  if (!resultSummary.success) {
    return {
      success: false,
      error: "Síntese de currículo falhou.",
    };
  }
  if (!resultHardSkills.success) {
    return {
      success: false,
      error: "Síntese de currículo falhou.",
    };
  }

  const merged: SynthesizedFields = {
    summary: resultSummary.data.summary,
    hardSkillsByCategory: resultHardSkills.data.hardSkillsByCategory,
  };

  const validated = synthesizedFieldsSchema.safeParse(merged);

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
}
