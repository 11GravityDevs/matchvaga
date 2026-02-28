"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { runGapAnalysisAI } from "@/lib/ai/clients/openai";
import { jobSnapshotSchema } from "@/schemas/job";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { translateAuthError } from "@/utils/auth";

export interface RunGapAnalysisResult {
  success: boolean;
  analysisId?: string;
  score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  job_title?: string;
  job_company?: string;
  error?: string;
}

export interface AnalysisRow {
  id: string;
  resume_id: string;
  job_snapshot: { title: string; company: string; rawText: string };
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  created_at: string;
  status: string;
}

export interface GetAnalysesForUserResult {
  success: boolean;
  data?: AnalysisRow[];
  error?: string;
}

export async function runGapAnalysis(
  resumeId: string,
  jobDescription: string
): Promise<RunGapAnalysisResult> {
  const rawText = jobDescription.trim();
  if (rawText.length === 0) {
    return { success: false, error: "Cole a descrição da vaga para analisar." };
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
    .select("parsed_data")
    .eq("id", resumeId)
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

  const aiResult = await runGapAnalysisAI(resumeData, rawText);
  if (!aiResult.success) {
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
      resume_id: resumeId,
      job_snapshot: jobParsed.data as unknown as Record<string, unknown>,
      score: aiResult.data.score,
      matched_skills: aiResult.data.matched_skills,
      missing_skills: aiResult.data.missing_skills,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[runGapAnalysis] insert error:", insertError.message);
    return {
      success: false,
      error: "Erro ao salvar análise. Tente novamente.",
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
    analysisId: analysisRow.id,
    score: aiResult.data.score,
    matched_skills: aiResult.data.matched_skills,
    missing_skills: aiResult.data.missing_skills,
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
      "id, resume_id, job_snapshot, score, matched_skills, missing_skills, created_at, status"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAnalysesForUser] select error:", error.message);
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
      matched_skills: (row.matched_skills ?? []) as string[],
      missing_skills: (row.missing_skills ?? []) as string[],
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
      "id, resume_id, job_snapshot, score, matched_skills, missing_skills, created_at, status"
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
      matched_skills: (row.matched_skills ?? []) as string[],
      missing_skills: (row.missing_skills ?? []) as string[],
      created_at: row.created_at,
      status: row.status,
    },
  };
}
