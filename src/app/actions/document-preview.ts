"use server";

import {
  buildMergedResumeData,
  createSynthesisParams,
  type JobSnapshot,
  mergeUniqueSkills,
  selectedLabelsToOriginalTerms,
} from "@/app/actions/_utils/document-preview";
import {
  getPreviewAnalysisData,
  getUnlockAnalysisData,
  rollbackCredit,
  tryConsumeCredit,
} from "@/app/actions/_utils/document-preview-db";
import type { JobSkill } from "@/lib/ai/config/job-skills-schema";
import { synthesizeResumeContent } from "@/lib/ai/synthesize-resume";
import { logServerError } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/service";
import type { ResumeData } from "@/types/resume";
import { calculateOptimizedScore } from "@/utils/analysis";
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

  const previewDataResult = await getPreviewAnalysisData(
    supabase,
    user.id,
    analysisId
  );
  if (!previewDataResult.success) {
    return previewDataResult;
  }

  const analysisRow = previewDataResult.data;
  const resumeData = analysisRow.resumeData;

  const userHardSkills = (analysisRow.user_hard_skills ?? []) as string[];
  const userSoftSkills = (analysisRow.user_soft_skills ?? []) as string[];
  const missingHard = (analysisRow.missing_hard_skills ?? []) as JobSkill[];
  const missingSoft = (analysisRow.missing_soft_skills ?? []) as JobSkill[];

  const selectedHardOriginalTerms = selectedLabelsToOriginalTerms(
    selectedHardSkills ?? [],
    missingHard
  );
  const selectedSoftOriginalTerms = selectedLabelsToOriginalTerms(
    selectedSoftSkills ?? [],
    missingSoft
  );

  const mergedHardSkills = mergeUniqueSkills(
    userHardSkills,
    selectedHardOriginalTerms
  );

  const mergedSoftSkills = mergeUniqueSkills(
    userSoftSkills,
    selectedSoftOriginalTerms
  );

  const jobSnapshot = analysisRow.job_snapshot as JobSnapshot;
  const synthesisParams = createSynthesisParams(
    resumeData,
    mergedHardSkills,
    mergedSoftSkills,
    jobSnapshot
  );
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

  let status: "completed" | "pending_payment" = "pending_payment";
  let needsUnlock = true;
  let creditsDecremented = false;

  const creditResult = await tryConsumeCredit(
    user.id,
    "generateResumePreview_credit_decrement"
  );
  if (creditResult.consumed) {
    status = "completed";
    needsUnlock = false;
    creditsDecremented = true;
  }

  let mergedResumeData: ResumeData | null = null;

  if (status === "completed") {
    const synthesis = await synthesizeResumeContent(synthesisParams);

    if (!synthesis.success) {
      logServerError({
        context: "server_action",
        operation: "generateResumePreview",
        action: "generateResumePreview",
        message: "Síntese de currículo otimizado retornou erro.",
        errorMessage: synthesis.error,
      });

      if (creditsDecremented) {
        await rollbackCredit(
          user.id,
          "generateResumePreview_credit_increment_rollback_synthesis_failed"
        );
      }

      const adminSupabase = createAdminSupabaseClient();
      const { error: rollbackAnalysisError } = await adminSupabase
        .from("analyses")
        .update({
          status: "pending_payment",
          optimized_score: optimizedScore,
          optimized_resume_data: null,
          user_hard_skills: mergedHardSkills,
          user_soft_skills: mergedSoftSkills,
        })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      if (rollbackAnalysisError) {
        logServerError({
          context: "db",
          operation:
            "generateResumePreview_rollback_analysis_after_synthesis_fail",
          message: rollbackAnalysisError.message,
        });
      }

      return {
        success: false,
        error: "Não foi possível gerar o currículo otimizado. Tente novamente.",
      };
    }

    mergedResumeData = buildMergedResumeData(resumeData, synthesis.data);
  }

  const updatePayload: {
    status: string;
    optimized_score?: number;
    optimized_resume_data?: ResumeData | null;
    user_hard_skills: string[];
    user_soft_skills: string[];
  } = {
    status,
    optimized_score: optimizedScore,
    optimized_resume_data: mergedResumeData,
    user_hard_skills: mergedHardSkills,
    user_soft_skills: mergedSoftSkills,
  };

  const adminSupabase = createAdminSupabaseClient();
  const { error: updateStatusError } = await adminSupabase
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

    if (status === "completed" && needsUnlock === false) {
      await rollbackCredit(
        user.id,
        "generateResumePreview_credit_increment_rollback"
      );
    }

    return {
      success: false,
      error: "Erro ao salvar. Tente novamente.",
    };
  }

  revalidatePath("/inicio");

  return {
    success: true,
    data: status === "completed" ? (mergedResumeData ?? undefined) : undefined,
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

  const unlockDataResult = await getUnlockAnalysisData(
    supabase,
    user.id,
    analysisId
  );
  if (!unlockDataResult.success) {
    return unlockDataResult;
  }
  const analysisRow = unlockDataResult.data;

  if (analysisRow.status !== "pending_payment") {
    return {
      success: false,
      error:
        "Esta análise já está desbloqueada ou não está aguardando pagamento.",
    };
  }

  const resumeData = analysisRow.resumeData;

  const userHardSkills = (analysisRow.user_hard_skills ?? []) as string[];
  const userSoftSkills = (analysisRow.user_soft_skills ?? []) as string[];

  const jobSnapshot = analysisRow.job_snapshot as JobSnapshot;
  const synthesisParams = createSynthesisParams(
    resumeData,
    userHardSkills,
    userSoftSkills,
    jobSnapshot
  );

  const creditResult = await tryConsumeCredit(
    user.id,
    "unlockAnalysis_credit_decrement"
  );
  if (!creditResult.consumed) {
    return {
      success: false,
      error: "Sem análises disponíveis. Aguarde o processamento do pagamento.",
    };
  }

  const synthesis = await synthesizeResumeContent(synthesisParams);

  if (!synthesis.success) {
    logServerError({
      context: "server_action",
      operation: "unlockAnalysis",
      action: "unlockAnalysis",
      message: "Síntese de currículo otimizado retornou erro.",
      errorMessage: synthesis.error,
    });

    await rollbackCredit(
      user.id,
      "unlockAnalysis_credit_increment_rollback_synthesis_failed"
    );

    return {
      success: false,
      error: "Não foi possível gerar o currículo otimizado. Tente novamente.",
    };
  }

  const mergedResumeData: ResumeData = buildMergedResumeData(
    resumeData,
    synthesis.data
  );

  const optimizedScore = analysisRow.optimized_score ?? undefined;

  const adminSupabase = createAdminSupabaseClient();
  const { error: updateError } = await adminSupabase
    .from("analyses")
    .update({
      status: "completed",
      optimized_resume_data: mergedResumeData,
      optimized_score: optimizedScore,
    })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (updateError) {
    logServerError({
      context: "db",
      operation: "unlockAnalysis_status_update",
      message: updateError.message,
    });

    await rollbackCredit(user.id, "unlockAnalysis_credit_increment_rollback");

    return {
      success: false,
      error: "Erro ao desbloquear. Tente novamente.",
    };
  }

  revalidatePath("/inicio");

  return {
    success: true,
    data: mergedResumeData,
    optimizedScore,
  };
}
