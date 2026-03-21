import { logServerError } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/service";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";

type AuthSuccess = Extract<
  Awaited<ReturnType<typeof getAuthenticatedUser>>,
  { success: true }
>;

type SupabaseClient = AuthSuccess["supabase"];

export interface PreviewAnalysisData {
  id: string;
  resume_id: string;
  job_snapshot: unknown;
  score: number | null;
  user_hard_skills: unknown;
  user_soft_skills: unknown;
  missing_hard_skills: unknown;
  missing_soft_skills: unknown;
  resumeData: ResumeData;
}

export interface UnlockAnalysisData {
  id: string;
  status: string;
  resume_id: string;
  job_snapshot: unknown;
  optimized_score: number | null;
  user_hard_skills: unknown;
  user_soft_skills: unknown;
  resumeData: ResumeData;
}

async function getParsedResumeData(
  supabase: SupabaseClient,
  userId: string,
  resumeId: string
): Promise<
  { success: true; data: ResumeData } | { success: false; error: string }
> {
  const { data: resumeRow, error: resumeError } = await supabase
    .from("resumes")
    .select("parsed_data")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();

  if (resumeError || !resumeRow) {
    return { success: false, error: "Currículo não encontrado." };
  }

  const resumeParsed = resumeDataSchema.safeParse(resumeRow.parsed_data);
  if (!resumeParsed.success) {
    return { success: false, error: "Dados do currículo inválidos." };
  }

  return { success: true, data: resumeParsed.data as ResumeData };
}

export async function getPreviewAnalysisData(
  supabase: SupabaseClient,
  userId: string,
  analysisId: string
): Promise<
  | { success: true; data: PreviewAnalysisData }
  | { success: false; error: string }
> {
  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select(
      "id, resume_id, job_snapshot, score, user_hard_skills, user_soft_skills, missing_hard_skills, missing_soft_skills"
    )
    .eq("id", analysisId)
    .eq("user_id", userId)
    .single();

  if (analysisError || !analysisRow) {
    return { success: false, error: "Análise não encontrada." };
  }

  const parsedResume = await getParsedResumeData(
    supabase,
    userId,
    analysisRow.resume_id as string
  );
  if (!parsedResume.success) {
    return parsedResume;
  }

  return {
    success: true,
    data: {
      id: analysisRow.id as string,
      resume_id: analysisRow.resume_id as string,
      job_snapshot: analysisRow.job_snapshot,
      score: analysisRow.score as number | null,
      user_hard_skills: analysisRow.user_hard_skills,
      user_soft_skills: analysisRow.user_soft_skills,
      missing_hard_skills: analysisRow.missing_hard_skills,
      missing_soft_skills: analysisRow.missing_soft_skills,
      resumeData: parsedResume.data,
    },
  };
}

export async function getUnlockAnalysisData(
  supabase: SupabaseClient,
  userId: string,
  analysisId: string
): Promise<
  | { success: true; data: UnlockAnalysisData }
  | { success: false; error: string }
> {
  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select(
      "id, status, resume_id, job_snapshot, optimized_score, user_hard_skills, user_soft_skills"
    )
    .eq("id", analysisId)
    .eq("user_id", userId)
    .single();

  if (analysisError || !analysisRow) {
    return { success: false, error: "Análise não encontrada." };
  }

  const parsedResume = await getParsedResumeData(
    supabase,
    userId,
    analysisRow.resume_id as string
  );
  if (!parsedResume.success) {
    return parsedResume;
  }

  return {
    success: true,
    data: {
      id: analysisRow.id as string,
      status: analysisRow.status as string,
      resume_id: analysisRow.resume_id as string,
      job_snapshot: analysisRow.job_snapshot,
      optimized_score: analysisRow.optimized_score as number | null,
      user_hard_skills: analysisRow.user_hard_skills,
      user_soft_skills: analysisRow.user_soft_skills,
      resumeData: parsedResume.data,
    },
  };
}

export async function tryConsumeCredit(
  userId: string,
  operationPrefix: string
): Promise<{ consumed: boolean }> {
  const supabase = createAdminSupabaseClient();
  const { data: userCreditsRow, error: userCreditsError } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (userCreditsError) {
    logServerError({
      context: "db",
      operation: operationPrefix,
      message: userCreditsError.message,
    });
    return { consumed: false };
  }

  if (!userCreditsRow || userCreditsRow.credits < 1) {
    return { consumed: false };
  }

  const { data: updatedCreditsRow, error: updateCreditsError } = await supabase
    .from("user_credits")
    .update({
      credits: userCreditsRow.credits - 1,
    })
    .eq("user_id", userId)
    .select("credits")
    .maybeSingle();

  if (updateCreditsError || !updatedCreditsRow) {
    if (updateCreditsError) {
      logServerError({
        context: "db",
        operation: `${operationPrefix}_update`,
        message: updateCreditsError.message,
      });
    }
    return { consumed: false };
  }

  return { consumed: true };
}

export async function rollbackCredit(
  userId: string,
  operationPrefix: string
): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { data: rollbackCreditsRow, error: rollbackSelectError } =
    await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

  if (rollbackSelectError) {
    logServerError({
      context: "db",
      operation: `${operationPrefix}_select`,
      message: rollbackSelectError.message,
    });
    return;
  }

  const newRollbackCreditsTotal = (rollbackCreditsRow?.credits ?? 0) + 1;
  const { error: rollbackUpdateError } = await supabase
    .from("user_credits")
    .upsert(
      {
        user_id: userId,
        credits: newRollbackCreditsTotal,
      },
      {
        onConflict: "user_id",
      }
    );

  if (rollbackUpdateError) {
    logServerError({
      context: "db",
      operation: operationPrefix,
      message: rollbackUpdateError.message,
    });
  }
}
