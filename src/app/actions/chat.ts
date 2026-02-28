"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { refinementResponseSchema } from "@/lib/ai/config/refinement-response-schema";
import { REFINEMENT_SYSTEM_PROMPT } from "@/lib/ai/prompts/refinement";
import { normalizeAIResumeData } from "@/lib/ai/utils/normalize-resume";
import { createClient } from "@/lib/supabase/server";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { translateAuthError } from "@/utils/auth";

const MODEL = "gemini-2.5-flash-lite";

export interface ApplyCvRefinementResult {
  success: boolean;
  modifiedResume?: ResumeData;
  summary?: string;
  error?: string;
}

function buildRefinementUserPrompt(
  currentResumeData: ResumeData,
  instruction: string,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: string[],
  chatHistory: { role: "user" | "assistant"; content: string }[]
): string {
  const historyBlock =
    chatHistory.length > 0
      ? `\n---\nHistórico da conversa:\n${chatHistory
          .map(
            (m) =>
              `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`
          )
          .join("\n")}\n---\n`
      : "";

  return `Job: ${job.title} at ${job.company}
Job description (excerpt): ${job.rawText.slice(0, 500)}...
Matched skills: ${matchedSkills.join(", ") || "none"}
Missing skills: ${missingSkills.join(", ") || "none"}
${historyBlock}
Currículo atual (JSON):
${JSON.stringify(currentResumeData, null, 2)}

Instrução do usuário: ${instruction}

Apply the instruction and return { "modifiedResume": <full resume object>, "summary": "<brief summary in Portuguese>" }.`;
}

export async function applyCvRefinementInstruction(
  analysisId: string,
  currentResumeData: ResumeData,
  instruction: string,
  chatHistory: { role: "user" | "assistant"; content: string }[]
): Promise<ApplyCvRefinementResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GOOGLE_AI_API_KEY is not configured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return { success: false, error: translateAuthError(authError) };
  }
  if (!user) {
    return { success: false, error: "Faça login para continuar." };
  }

  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select("job_snapshot, matched_skills, missing_skills")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (analysisError || !analysisRow) {
    return { success: false, error: "Análise não encontrada." };
  }

  const jobSnapshot = analysisRow.job_snapshot as {
    title: string;
    company: string;
    rawText: string;
  };
  const matchedSkills = (analysisRow.matched_skills ?? []) as string[];
  const missingSkills = (analysisRow.missing_skills ?? []) as string[];

  const userPrompt = buildRefinementUserPrompt(
    currentResumeData,
    instruction,
    jobSnapshot,
    matchedSkills,
    missingSkills,
    chatHistory
  );

  const fullPrompt = `${REFINEMENT_SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: refinementResponseSchema,
      },
    });

    const result = await model.generateContent([{ text: fullPrompt }]);
    const response = result.response;
    const content = response.text();

    if (!content) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    const parsed = JSON.parse(content.trim()) as {
      modifiedResume?: unknown;
      summary?: string;
    };

    if (!parsed.modifiedResume || typeof parsed.modifiedResume !== "object") {
      return {
        success: false,
        error: "Resposta inválida: currículo modificado não encontrado.",
      };
    }

    const normalized = normalizeAIResumeData(parsed.modifiedResume);
    const validated = resumeDataSchema.safeParse(normalized);

    if (!validated.success) {
      return {
        success: false,
        error: "Não foi possível interpretar as alterações. Tente novamente.",
      };
    }

    const summary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "Alterações aplicadas.";

    return {
      success: true,
      modifiedResume: validated.data,
      summary,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Não foi possível interpretar a resposta. Tente novamente.",
      };
    }
    console.error(
      "[applyCvRefinementInstruction] Gemini error:",
      error instanceof Error ? error.message : error
    );
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao processar instrução." };
  }
}
