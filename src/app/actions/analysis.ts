"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { runGapAnalysisAI } from "@/lib/ai/clients/openai";
import { logServerError } from "@/lib/logger";
import { jobSnapshotSchema } from "@/schemas/job";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { translateAuthError } from "@/utils/auth";
import {
  missingSkillsFromColumns,
  type MissingSkillsByCategory,
} from "@/utils/analysis";
import {
  JOB_DESCRIPTION_TOO_LONG_MESSAGE,
  NOT_JOB_DESCRIPTION_MESSAGE,
  validateJobDescriptionText,
} from "@/utils/job-description";

export interface RunGapAnalysisResult {
  success: boolean;
  analysisId?: string;
  score?: number;
  matched_skills?: string[];
  missing_technical_skills?: string[];
  missing_behavioral_skills?: string[];
  job_title?: string;
  job_company?: string;
  error?: string;
}

export type { MissingSkillsByCategory } from "@/utils/analysis";

export interface AnalysisRow {
  id: string;
  resume_id: string;
  job_snapshot: { title: string; company: string; rawText: string };
  score: number;
  optimized_score: number;
  matched_skills: string[];
  missing_skills: MissingSkillsByCategory;
  created_at: string;
  status: string;
}

export interface GetAnalysesForUserResult {
  success: boolean;
  data?: AnalysisRow[];
  error?: string;
}

export async function runGapAnalysis(
  jobDescription: string
): Promise<RunGapAnalysisResult> {
  const rawText = jobDescription.trim();
  if (rawText.length === 0) {
    return { success: false, error: "Cole a descrição da vaga para analisar." };
  }

  const heuristic = validateJobDescriptionText(rawText);
  if (!heuristic.valid) {
    const error =
      heuristic.errorCode === "max"
        ? JOB_DESCRIPTION_TOO_LONG_MESSAGE
        : NOT_JOB_DESCRIPTION_MESSAGE;
    return { success: false, error };
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

  const { data: resumeRow, error: resumeError } = await supabase
    .from("resumes")
    .select("id, parsed_data")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (resumeError || !resumeRow) {
    return {
      success: false,
      error:
        "Nenhum currículo encontrado. Faça o upload do seu currículo para continuar.",
    };
  }

  const resumeParsed = resumeDataSchema.safeParse(resumeRow.parsed_data);
  if (!resumeParsed.success) {
    return { success: false, error: "Dados do currículo inválidos." };
  }

  const resumeData = resumeParsed.data as ResumeData;

  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  const credits = creditsRow?.credits ?? 0;
  if (credits < 1) {
    return {
      success: false,
      error: "Sem análises disponíveis",
    };
  }

  const aiResult = await runGapAnalysisAI(resumeData, rawText);
  if (!aiResult.success) {
    const isNotJobError = aiResult.error === NOT_JOB_DESCRIPTION_MESSAGE;

    if (!isNotJobError) {
      logServerError({
        context: "server_action",
        operation: "runGapAnalysis",
        action: "runGapAnalysis",
        message: "Análise de gap (IA) retornou erro.",
        errorMessage: aiResult.error,
      });
    }
    return { success: false, error: aiResult.error };
  }

  const jobSnapshot = {
    title: aiResult.data.job_title,
    company: aiResult.data.job_company,
    rawText,
  };
  const jobParsed = jobSnapshotSchema.safeParse(jobSnapshot);
  if (!jobParsed.success) {
    return { success: false, error: "Dados da vaga inválidos." };
  }

  const { data: analysisRow, error: insertError } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      resume_id: resumeRow.id,
      job_snapshot: jobParsed.data as unknown as Record<string, unknown>,
      score: aiResult.data.score,
      optimized_score: 0,
      matched_skills: aiResult.data.matched_skills,
      missing_technical_skills: aiResult.data.missing_technical_skills,
      missing_behavioral_skills: aiResult.data.missing_behavioral_skills,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    logServerError({
      context: "db",
      operation: "runGapAnalysis_insert",
      message: insertError.message,
    });
    return {
      success: false,
      error: "Erro ao salvar análise. Tente novamente.",
    };
  }

  const { data: updatedCredits, error: decrementError } = await supabase
    .from("user_credits")
    .update({
      credits: credits - 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .gte("credits", 1)
    .select("credits");

  if (decrementError || !updatedCredits?.length) {
    if (decrementError) {
      logServerError({
        context: "db",
        operation: "runGapAnalysis_credit_decrement",
        message: decrementError.message,
      });
    }
    await supabase.from("analyses").delete().eq("id", analysisRow.id);
    return {
      success: false,
      error: "Sem análises disponíveis",
    };
  }

  revalidatePath("/inicio");

  return {
    success: true,
    analysisId: analysisRow.id,
    score: aiResult.data.score,
    matched_skills: aiResult.data.matched_skills,
    missing_technical_skills: aiResult.data.missing_technical_skills,
    missing_behavioral_skills: aiResult.data.missing_behavioral_skills,
    job_title: aiResult.data.job_title,
    job_company: aiResult.data.job_company,
  };
}

export async function getAnalysesForUser(): Promise<GetAnalysesForUserResult> {
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

  const { data, error } = await supabase
    .from("analyses")
    .select(
      "id, resume_id, job_snapshot, score, optimized_score, matched_skills, missing_technical_skills, missing_behavioral_skills, created_at, status"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    logServerError({
      context: "db",
      operation: "getAnalysesForUser_select",
      message: error.message,
    });
    return {
      success: false,
      error: "Erro ao carregar análises.",
    };
  }

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      resume_id: row.resume_id,
      job_snapshot: row.job_snapshot as {
        title: string;
        company: string;
        rawText: string;
      },
      score: row.score,
      optimized_score: row.optimized_score ?? null,
      matched_skills: (row.matched_skills ?? []) as string[],
      missing_skills: missingSkillsFromColumns(
        row.missing_technical_skills,
        row.missing_behavioral_skills
      ),
      created_at: row.created_at,
      status: row.status ?? "pending",
    })),
  };
}

export interface GetAnalysisByIdResult {
  success: boolean;
  data?: AnalysisRow;
  error?: string;
}

export async function getAnalysisById(
  analysisId: string
): Promise<GetAnalysisByIdResult> {
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

  const { data: row, error } = await supabase
    .from("analyses")
    .select(
      "id, resume_id, job_snapshot, score, optimized_score, matched_skills, missing_technical_skills, missing_behavioral_skills, created_at, status"
    )
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (error || !row) {
    return { success: false, error: "Análise não encontrada." };
  }

  return {
    success: true,
    data: {
      id: row.id,
      resume_id: row.resume_id,
      job_snapshot: row.job_snapshot as {
        title: string;
        company: string;
        rawText: string;
      },
      score: row.score,
      optimized_score: row.optimized_score,
      matched_skills: (row.matched_skills ?? []) as string[],
      missing_skills: missingSkillsFromColumns(
        row.missing_technical_skills,
        row.missing_behavioral_skills
      ),
      created_at: row.created_at,
      status: row.status,
    },
  };
}
