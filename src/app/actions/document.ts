"use server";

import { synthesizeResumeContent } from "@/lib/ai/clients";
import type { JobSkill } from "@/lib/ai/config/job-skills-schema";
import { buildResumeDocx } from "@/lib/document/resume-to-docx";
import { ResumeDocument } from "@/lib/document/resume-to-pdf";
import { logServerError } from "@/lib/logger";
import {
  getAuthenticatedUser,
  type GetAuthenticatedUserSuccess,
} from "@/lib/supabase/server";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { calculateOptimizedScore } from "@/utils/analysis";
import { renderToBuffer } from "@react-pdf/renderer";
import { revalidatePath } from "next/cache";
import React from "react";

const BUCKET = "documents";
const SIGNED_URL_EXPIRES_IN = 3600;

export interface GenerateResumePreviewResult {
  success: boolean;
  data?: ResumeData;
  optimizedScore?: number;
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

  const updatePayload: { status: string; optimized_score?: number } = {
    status: "completed",
    optimized_score: optimizedScore,
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
  }

  return {
    success: true,
    data: mergedResumeData,
    optimizedScore,
  };
}

export interface GenerateOptimizedDocumentResult {
  success: boolean;
  url?: string;
  error?: string;
}

type SupabaseServer = GetAuthenticatedUserSuccess["supabase"];

async function generateOptimizedDocumentWithContext(
  supabase: SupabaseServer,
  userId: string,
  analysisId: string,
  format: "pdf" | "docx",
  resumeData: ResumeData
): Promise<GenerateOptimizedDocumentResult> {
  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select("id")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .single();

  if (analysisError || !analysisRow) {
    return { success: false, error: "Análise não encontrada." };
  }

  const { data: existingDoc, error: docLookupError } = await supabase
    .from("optimized_documents")
    .select("file_path")
    .eq("analysis_id", analysisId)
    .eq("format", format)
    .maybeSingle();

  if (!docLookupError && existingDoc?.file_path) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(existingDoc.file_path, SIGNED_URL_EXPIRES_IN);

    if (!signedError && signedData?.signedUrl) {
      return {
        success: true,
        url: signedData.signedUrl,
      };
    }
    logServerError({
      context: "db",
      operation: "generateOptimizedDocument_signedUrl_existing",
      message: signedError?.message ?? "Unknown",
    });
  } else if (docLookupError) {
    logServerError({
      context: "db",
      operation: "generateOptimizedDocument_lookup",
      message: docLookupError.message,
    });
  }

  const resumeParsed = resumeDataSchema.safeParse(resumeData);
  if (!resumeParsed.success) {
    return { success: false, error: "Dados do currículo inválidos." };
  }

  const validResumeData = resumeParsed.data as ResumeData;

  let buffer: Buffer;

  if (format === "pdf") {
    const docElement = React.createElement(ResumeDocument, {
      data: validResumeData,
    });
    buffer = await renderToBuffer(
      docElement as Parameters<typeof renderToBuffer>[0]
    );
  } else {
    buffer = await buildResumeDocx(validResumeData);
  }

  const filePath = `${userId}/${analysisId}.${format}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType:
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      upsert: true,
    });

  if (uploadError) {
    logServerError({
      context: "db",
      operation: "generateOptimizedDocument_upload",
      message: uploadError.message,
    });
    return {
      success: false,
      error:
        "Erro ao salvar documento. Verifique se o bucket 'documents' existe.",
    };
  }

  const { error: insertError } = await supabase
    .from("optimized_documents")
    .insert({
      analysis_id: analysisId,
      file_path: filePath,
      format,
    });

  if (insertError) {
    logServerError({
      context: "db",
      operation: "generateOptimizedDocument_insert",
      message: insertError.message,
    });
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN);

  if (signedError || !signedData?.signedUrl) {
    logServerError({
      context: "db",
      operation: "generateOptimizedDocument_signedUrl",
      message: signedError?.message ?? "Unknown",
    });
    return {
      success: false,
      error: "Erro ao gerar link de download.",
    };
  }

  revalidatePath("/inicio");

  return {
    success: true,
    url: signedData.signedUrl,
  };
}

export async function downloadOptimizedDocument(
  analysisId: string,
  format: "pdf" | "docx"
): Promise<GenerateOptimizedDocumentResult> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }
  const { user, supabase } = auth;

  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select("id, resume_id")
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

  return generateOptimizedDocumentWithContext(
    supabase,
    user.id,
    analysisId,
    format,
    resumeParsed.data
  );
}

export async function generateOptimizedDocument(
  analysisId: string,
  format: "pdf" | "docx",
  resumeData: ResumeData
): Promise<GenerateOptimizedDocumentResult> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }
  const { user, supabase } = auth;

  return generateOptimizedDocumentWithContext(
    supabase,
    user.id,
    analysisId,
    format,
    resumeData
  );
}
