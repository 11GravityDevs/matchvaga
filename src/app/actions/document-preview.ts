"use server";

import { synthesizeResumeContent } from "@/lib/ai/synthesize-resume";
import type { JobSkill } from "@/lib/ai/config/job-skills-schema";
import { logServerError } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { resumeDataSchema } from "@/schemas/resume";
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

  let status: "completed" | "pending_payment" = "pending_payment";
  let needsUnlock = true;

  const { data: userCreditsRow, error: userCreditsError } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!userCreditsError && userCreditsRow && userCreditsRow.credits >= 1) {
    const { data: updatedCreditsRow, error: updateCreditsError } =
      await supabase
        .from("user_credits")
        .update({
          credits: userCreditsRow.credits - 1,
        })
        .eq("user_id", user.id)
        .select("credits")
        .maybeSingle();

    if (!updateCreditsError && updatedCreditsRow) {
      status = "completed";
      needsUnlock = false;
    }
  }

  if (userCreditsError) {
    logServerError({
      context: "db",
      operation: "generateResumePreview_credit_decrement",
      message: userCreditsError.message,
    });
  }

  if (status === "completed" && needsUnlock === false) {
    status = "completed";
    needsUnlock = false;
  }

  const updatePayload: {
    status: string;
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

    if (status === "completed" && needsUnlock === false) {
      const { data: rollbackCreditsRow, error: rollbackSelectError } =
        await supabase
          .from("user_credits")
          .select("credits")
          .eq("user_id", user.id)
          .maybeSingle();

      if (!rollbackSelectError) {
        const newRollbackCreditsTotal = (rollbackCreditsRow?.credits ?? 0) + 1;

        const { error: rollbackUpdateError } = await supabase
          .from("user_credits")
          .upsert(
            {
              user_id: user.id,
              credits: newRollbackCreditsTotal,
            },
            {
              onConflict: "user_id",
            }
          );

        if (rollbackUpdateError) {
          logServerError({
            context: "db",
            operation: "generateResumePreview_credit_increment_rollback",
            message: rollbackUpdateError.message,
          });
        }
      } else {
        logServerError({
          context: "db",
          operation: "generateResumePreview_credit_increment_rollback_select",
          message: rollbackSelectError.message,
        });
      }
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

  const { data: userCreditsRow, error: userCreditsError } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .maybeSingle();

  if (userCreditsError || !userCreditsRow || userCreditsRow.credits < 1) {
    if (userCreditsError) {
      logServerError({
        context: "db",
        operation: "unlockAnalysis_credit_decrement",
        message: userCreditsError.message,
      });
    }
    return {
      success: false,
      error: "Sem créditos disponíveis. Aguarde o processamento do pagamento.",
    };
  }

  const { data: updatedCreditsRow, error: updateCreditsError } = await supabase
    .from("user_credits")
    .update({
      credits: userCreditsRow.credits - 1,
    })
    .eq("user_id", user.id)
    .select("credits")
    .maybeSingle();

  if (updateCreditsError || !updatedCreditsRow) {
    if (updateCreditsError) {
      logServerError({
        context: "db",
        operation: "unlockAnalysis_credit_decrement_update",
        message: updateCreditsError.message,
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
    const { data: rollbackCreditsRow, error: rollbackSelectError } =
      await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!rollbackSelectError) {
      const newRollbackCreditsTotal = (rollbackCreditsRow?.credits ?? 0) + 1;

      const { error: rollbackUpdateError } = await supabase
        .from("user_credits")
        .upsert(
          {
            user_id: user.id,
            credits: newRollbackCreditsTotal,
          },
          {
            onConflict: "user_id",
          }
        );

      if (rollbackUpdateError) {
        logServerError({
          context: "db",
          operation: "unlockAnalysis_credit_increment_rollback",
          message: rollbackUpdateError.message,
        });
      }
    } else {
      logServerError({
        context: "db",
        operation: "unlockAnalysis_credit_increment_rollback_select",
        message: rollbackSelectError.message,
      });
    }
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
