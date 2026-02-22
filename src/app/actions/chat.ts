"use server";

import OpenAI from "openai";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { translateAuthError } from "@/utils/auth";

const MODEL = "gpt-4o-mini";

export interface SendChatMessageResult {
  success: boolean;
  content?: string;
  error?: string;
}

export interface ApplyChatSuggestionResult {
  success: boolean;
  error?: string;
}

export interface ChatSuggestion {
  field: keyof ResumeData;
  value: unknown;
}

function buildChatSystemPrompt(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: string[]
): string {
  return `You are an expert resume coach helping a candidate improve their resume for a specific job.

Job: ${job.title} at ${job.company}
Job description (excerpt): ${job.rawText.slice(0, 500)}...

Candidate's current resume summary: ${resumeData.summary}
Skills: ${resumeData.skills.join(", ")}
Matched skills (emphasize): ${matchedSkills.join(", ")}
Missing skills (suggest adding): ${missingSkills.join(", ")}

Respond in Portuguese. Be concise and actionable. When suggesting edits, you can propose specific text changes (e.g. "Altere o resumo para: ..." or "Adicione a habilidade X").`;
}

export async function sendChatMessage(
  analysisId: string,
  message: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<SendChatMessageResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "OPENAI_API_KEY is not configured" };
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
    .select("resume_id, job_snapshot, matched_skills, missing_skills")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (analysisError || !analysisRow) {
    return { success: false, error: "Análise não encontrada." };
  }

  const { data: resumeRow, error: resumeError } = await supabase
    .from("resumes")
    .select("parsed_data")
    .eq("id", analysisRow.resume_id)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resumeRow) {
    return { success: false, error: "Currículo não encontrado." };
  }

  const resumeParsed = resumeDataSchema.safeParse(resumeRow.parsed_data);
  if (!resumeParsed.success) {
    return { success: false, error: "Dados do currículo inválidos." };
  }

  const resumeData = resumeParsed.data as ResumeData;
  const jobSnapshot = analysisRow.job_snapshot as {
    title: string;
    company: string;
    rawText: string;
  };
  const matchedSkills = (analysisRow.matched_skills ?? []) as string[];
  const missingSkills = (analysisRow.missing_skills ?? []) as string[];

  const systemPrompt = buildChatSystemPrompt(
    resumeData,
    jobSnapshot,
    matchedSkills,
    missingSkills
  );

  const client = new OpenAI({ apiKey });

  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: openaiMessages,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    return { success: true, content };
  } catch (error) {
    console.error(
      "[sendChatMessage] OpenAI error:",
      error instanceof Error ? error.message : error
    );
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao processar mensagem." };
  }
}

export async function applyChatSuggestion(
  resumeId: string,
  suggestion: ChatSuggestion
): Promise<ApplyChatSuggestionResult> {
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

  const { data: resumeRow, error: resumeError } = await supabase
    .from("resumes")
    .select("parsed_data")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resumeRow) {
    return { success: false, error: "Currículo não encontrado." };
  }

  const currentParsed = resumeDataSchema.safeParse(resumeRow.parsed_data);
  if (!currentParsed.success) {
    return { success: false, error: "Dados do currículo inválidos." };
  }

  const current = currentParsed.data as ResumeData;
  const field = suggestion.field;
  const value = suggestion.value;

  if (!(field in current)) {
    return { success: false, error: `Campo inválido: ${field}` };
  }

  const updated = { ...current, [field]: value };
  const validated = resumeDataSchema.safeParse(updated);

  if (!validated.success) {
    return {
      success: false,
      error: "Sugestão inválida. Verifique os dados.",
    };
  }

  const { error: updateError } = await supabase
    .from("resumes")
    .update({
      parsed_data: validated.data as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[applyChatSuggestion] update error:", updateError.message);
    return {
      success: false,
      error: "Erro ao aplicar alteração.",
    };
  }

  revalidatePath("/dashboard");

  return { success: true };
}
