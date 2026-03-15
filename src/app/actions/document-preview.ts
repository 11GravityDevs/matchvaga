"use server";

import { synthesizeResumeContent } from "@/lib/ai/synthesize-resume";
import type { JobSkill } from "@/lib/ai/config/job-skills-schema";
import { logServerError } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { calculateOptimizedScore } from "@/utils/analysis";
import type { AnalysisStatus } from "@/types/analysis";
import { revalidatePath } from "next/cache";

export interface GenerateResumePreviewResult {
  success: boolean;
  data?: ResumeData;
  optimizedScore?: number;
  needsUnlock?: boolean;
  error?: string;
}

export async function generateResumePreview(
  analysisId: string,
  selectedHardSkills?: string[],
  selectedSoftSkills?: string[]
): Promise<GenerateResumePreviewResult> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }
  const { user, supabase } = auth;

  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select(
      "id, resume_id, job_snapshot, score, user_hard_skills, user_soft_skills, missing_hard_skills, missing_soft_skills"
    )
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

  const userHardSkills = (analysisRow.user_hard_skills ?? []) as string[];
  const userSoftSkills = (analysisRow.user_soft_skills ?? []) as string[];
  const missingHard = (analysisRow.missing_hard_skills ?? []) as JobSkill[];
  const missingSoft = (analysisRow.missing_soft_skills ?? []) as JobSkill[];

  function selectedLabelsToOriginalTerms(
    selectedLabels: string[],
    skills: JobSkill[]
  ): string[] {
    const byName = new Map(skills.map((s) => [s.name, s.original_term]));
    return selectedLabels
      .map((label) => byName.get(label) ?? label)
      .filter(Boolean);
  }

  const selectedHardOriginalTerms = selectedLabelsToOriginalTerms(
    selectedHardSkills ?? [],
    missingHard
  );
  const selectedSoftOriginalTerms = selectedLabelsToOriginalTerms(
    selectedSoftSkills ?? [],
    missingSoft
  );

  const mergedHardSkills = [
    ...userHardSkills,
    ...selectedHardOriginalTerms.filter((t) => !userHardSkills.includes(t)),
  ];

  const mergedSoftSkills = [
    ...userSoftSkills,
    ...selectedSoftOriginalTerms.filter((t) => !userSoftSkills.includes(t)),
  ];

  const jobSnapshot = analysisRow.job_snapshot as
    | { title?: string; company?: string }
    | null
    | undefined;
  const synthesisParams = {
    summary: resumeData.summary,
    hardSkills: mergedHardSkills,
    softSkills: mergedSoftSkills,
    jobTitle: jobSnapshot?.title ?? undefined,
  };

  const synthesis = await synthesizeResumeContent(synthesisParams);

  if (!synthesis.success) {
    logServerError({
      context: "server_action",
      operation: "generateResumePreview",
      action: "generateResumePreview",
      message: "Síntese de currículo otimizado retornou erro.",
      errorMessage: synthesis.error,
    });
    return { success: false, error: synthesis.error };
  }

  const analysisScore = (analysisRow.score ?? 0) as number;

  let optimizedScore = calculateOptimizedScore(
    analysisScore,
    missingHard,
    missingSoft,
    mergedHardSkills,
    mergedSoftSkills
  );

  if (analysisScore > optimizedScore) {
    optimizedScore = analysisScore;
  }

  const mergedResumeData: ResumeData = {
    ...resumeData,
    summary: synthesis.data.summary,
    hardSkillsByCategory: synthesis.data.hardSkillsByCategory,
  };

  let status: Extract<AnalysisStatus, "completed" | "pending_payment"> =
    "pending_payment";
  let needsUnlock = true;

  const { data: newCredits, error: decrementError } = await supabase.rpc(
    "decrement_user_credits",
    {
      user_id_param: user.id,
      amount: 1,
    }
  );

  if (!decrementError && newCredits !== null) {
    status = "completed";
    needsUnlock = false;
  }

  const updatePayload: {
    status: AnalysisStatus;
    optimized_score?: number;
    optimized_resume_data?: ResumeData;
  } = {
    status,
    optimized_score: optimizedScore,
    optimized_resume_data: mergedResumeData,
  };

  const { error: updateStatusError } = await supabase
    .from("analyses")
    .update(updatePayload)
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (updateStatusError) {
    logServerError({
      context: "db",
      operation: "generateResumePreview_status_update",
      message: updateStatusError.message,
    });

    if (status === "completed") {
      await supabase.rpc("increment_user_credits", {
        user_id_param: user.id,
        amount: 1,
      });
    }

    return {
      success: false,
      error: "Erro ao salvar. Tente novamente.",
    };
  }

  revalidatePath("/inicio");

  return {
    success: true,
    data: mergedResumeData,
    optimizedScore,
    needsUnlock,
  };
}

export interface UnlockAnalysisResult {
  success: boolean;
  data?: ResumeData;
  optimizedScore?: number;
  error?: string;
}

export async function unlockAnalysis(
  analysisId: string
): Promise<UnlockAnalysisResult> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }
  const { user, supabase } = auth;

  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select("id, status, optimized_resume_data, optimized_score")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (analysisError || !analysisRow) {
    return { success: false, error: "Análise não encontrada." };
  }

  if (analysisRow.status !== "pending_payment") {
    return {
      success: false,
      error:
        "Esta análise já está desbloqueada ou não está aguardando pagamento.",
    };
  }

  const optimizedParsed =
    analysisRow.optimized_resume_data != null
      ? resumeDataSchema.safeParse(analysisRow.optimized_resume_data)
      : null;

  if (!optimizedParsed?.success) {
    return {
      success: false,
      error: "Dados do currículo inválidos.",
    };
  }

  const { data: newCredits, error: decrementError } = await supabase.rpc(
    "decrement_user_credits",
    {
      user_id_param: user.id,
      amount: 1,
    }
  );

  if (decrementError || newCredits === null) {
    if (decrementError) {
      logServerError({
        context: "db",
        operation: "unlockAnalysis_credit_decrement",
        message: decrementError.message,
      });
    }
    return {
      success: false,
      error: "Sem créditos disponíveis. Aguarde o processamento do pagamento.",
    };
  }

  const { error: updateError } = await supabase
    .from("analyses")
    .update({ status: "completed" })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (updateError) {
    logServerError({
      context: "db",
      operation: "unlockAnalysis_status_update",
      message: updateError.message,
    });
    await supabase.rpc("increment_user_credits", {
      user_id_param: user.id,
      amount: 1,
    });
    return {
      success: false,
      error: "Erro ao desbloquear. Tente novamente.",
    };
  }

  revalidatePath("/inicio");

  return {
    success: true,
    data: optimizedParsed.data as ResumeData,
    optimizedScore: analysisRow.optimized_score ?? undefined,
  };
}
