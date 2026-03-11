"use server";

import { revalidatePath } from "next/cache";

import { extractJobSkills, matchJobSkillsToResume } from "@/lib/ai/clients";
import type { JobSkill } from "@/lib/ai/config/job-skills-schema";
import { logServerError } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { jobSnapshotSchema, type JobSnapshot } from "@/schemas/job";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import {
  applySkillsMatchToUserSkills,
  calculateAtsScore,
  missingSkillsFromJobSkillColumns,
  type MissingSkillsByCategory,
} from "@/utils/analysis";
import {
  JOB_DESCRIPTION_TOO_LONG_MESSAGE,
  NOT_JOB_DESCRIPTION_MESSAGE,
  validateJobDescriptionText,
} from "@/utils/job-description";

export type { MissingSkillsByCategory } from "@/utils/analysis";

export interface RunSkillsMatchResult {
  success: boolean;
  analysisId?: string;
  score?: number;
  matched_skills_count?: number;
  missing_hard_skills?: JobSkill[];
  missing_soft_skills?: JobSkill[];
  job_title?: string;
  job_company?: string;
  error?: string;
}

export interface AnalysisRow {
  id: string;
  resume_id: string;
  job_snapshot: JobSnapshot;
  score: number;
  optimized_score: number;
  matched_skills_count: number;
  missing_skills: MissingSkillsByCategory;
  created_at: string;
  status: string;
}

export interface GetAnalysesForUserResult {
  success: boolean;
  data?: AnalysisRow[];
  error?: string;
}

export async function runSkillsMatch(
  jobDescription: string
): Promise<RunSkillsMatchResult> {
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

  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, error: auth.error };
  }
  const { user, supabase } = auth;

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

  const jobSkillsResult = await extractJobSkills(rawText);

  if (!jobSkillsResult.success) {
    logServerError({
      context: "server_action",
      operation: "runSkillsMatch",
      action: "runSkillsMatch",
      message: "Extração de skills da vaga (IA) retornou erro.",
      errorMessage: jobSkillsResult.error,
    });

    return { success: false, error: jobSkillsResult.error };
  }

  const matchResult = await matchJobSkillsToResume(
    jobSkillsResult.data,
    resumeData
  );

  if (!matchResult.success) {
    logServerError({
      context: "server_action",
      operation: "runSkillsMatch",
      action: "runSkillsMatch",
      message: "Match de habilidades vaga x currículo retornou erro.",
      errorMessage: matchResult.error,
    });

    return { success: false, error: matchResult.error };
  }

  const matched_skills_count = matchResult.data.length;

  const user_hard_skills = [...(resumeData.hardSkills ?? [])];
  const user_soft_skills = [...(resumeData.softSkills ?? [])];

  const applied = applySkillsMatchToUserSkills(
    user_hard_skills,
    user_soft_skills,
    matchResult.data
  );

  const appliedHardSet = new Set(applied.user_hard_skills);
  const appliedSoftSet = new Set(applied.user_soft_skills);

  const missing_hard_skills = jobSkillsResult.data.hard_skills.filter(
    (s) => !appliedHardSet.has(s.original_term)
  );

  const missing_soft_skills = jobSkillsResult.data.soft_skills.filter(
    (s) => !appliedSoftSet.has(s.original_term)
  );

  const score = calculateAtsScore(
    jobSkillsResult.data.hard_skills,
    jobSkillsResult.data.soft_skills,
    missing_hard_skills,
    missing_soft_skills
  );

  const jobSnapshot = {
    title: jobSkillsResult.data.job_title,
    company: jobSkillsResult.data.job_company,
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
      score,
      optimized_score: 0,
      matched_skills_count: matched_skills_count,
      user_hard_skills: applied.user_hard_skills,
      user_soft_skills: applied.user_soft_skills,
      missing_hard_skills,
      missing_soft_skills,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    logServerError({
      context: "db",
      operation: "runSkillsMatch_insert",
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
        operation: "runSkillsMatch_credit_decrement",
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
    score,
    matched_skills_count,
    missing_hard_skills,
    missing_soft_skills,
    job_title: jobParsed.data.title,
    job_company: jobParsed.data.company,
  };
}

export async function getAnalysesForUser(): Promise<GetAnalysesForUserResult> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }
  const { user, supabase } = auth;

  const { data, error } = await supabase
    .from("analyses")
    .select(
      "id, resume_id, job_snapshot, score, optimized_score, matched_skills_count, missing_hard_skills, missing_soft_skills, created_at, status"
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
    data: (data ?? []).map((row) => {
      return {
        id: row.id,
        resume_id: row.resume_id,
        job_snapshot: row.job_snapshot as JobSnapshot,
        score: row.score,
        optimized_score: row.optimized_score,
        matched_skills_count: row.matched_skills_count,
        missing_skills: missingSkillsFromJobSkillColumns(
          row.missing_hard_skills,
          row.missing_soft_skills
        ),
        created_at: row.created_at,
        status: row.status ?? "pending",
      };
    }),
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
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }
  const { user, supabase } = auth;

  const { data: row, error } = await supabase
    .from("analyses")
    .select(
      "id, resume_id, job_snapshot, score, optimized_score, matched_skills_count, missing_hard_skills, missing_soft_skills, created_at, status"
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
      job_snapshot: row.job_snapshot as JobSnapshot,
      score: row.score,
      optimized_score: row.optimized_score,
      matched_skills_count: row.matched_skills_count,
      missing_skills: missingSkillsFromJobSkillColumns(
        row.missing_hard_skills,
        row.missing_soft_skills
      ),
      created_at: row.created_at,
      status: row.status,
    },
  };
}
