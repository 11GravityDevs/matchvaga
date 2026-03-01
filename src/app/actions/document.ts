"use server";

import React from "react";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { synthesizeOptimizedResume } from "@/lib/ai/clients/anthropic";
import { runGapAnalysisAI } from "@/lib/ai/clients/openai";
import { ResumeDocument } from "@/lib/document/resume-to-pdf";
import { buildResumeDocx } from "@/lib/document/resume-to-docx";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { translateAuthError } from "@/utils/auth";

const BUCKET = "documents";
const SIGNED_URL_EXPIRES_IN = 3600;

export interface SynthesizeOptimizedResumeResult {
  success: boolean;
  data?: ResumeData;
  optimizedScore?: number;
  error?: string;
}

export async function synthesizeOptimizedResumeForPreview(
  analysisId: string,
  selectedTechnicalSkills?: string[],
  selectedBehavioralSkills?: string[]
): Promise<SynthesizeOptimizedResumeResult> {
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
    .select(
      "id, resume_id, job_snapshot, matched_skills, missing_technical_skills, missing_behavioral_skills"
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
  const jobSnapshot = analysisRow.job_snapshot as {
    title: string;
    company: string;
    rawText: string;
  };
  const matchedSkills = (analysisRow.matched_skills ?? []) as string[];
  const technical = selectedTechnicalSkills ?? [];
  const behavioral = selectedBehavioralSkills ?? [];
  const hasAnyMissing = technical.length > 0 || behavioral.length > 0;

  const synthesis = await synthesizeOptimizedResume(
    resumeData,
    jobSnapshot,
    matchedSkills,
    hasAnyMissing ? { technical, behavioral } : undefined
  );

  if (!synthesis.success) {
    return { success: false, error: synthesis.error };
  }

  let optimizedScore: number | undefined;

  const aiResult = await runGapAnalysisAI(synthesis.data, jobSnapshot.rawText);

  if (aiResult.success) {
    optimizedScore = aiResult.data.score;
  } else {
    console.error(
      "[synthesizeOptimizedResumeForPreview] re-score error:",
      aiResult.error
    );
  }

  const updatePayload: { status: string; optimized_score?: number } = {
    status: "completed",
  };
  if (optimizedScore != null) {
    updatePayload.optimized_score = optimizedScore;
  }

  const { error: updateStatusError } = await supabase
    .from("analyses")
    .update(updatePayload)
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (updateStatusError) {
    console.error(
      "[synthesizeOptimizedResumeForPreview] status update error:",
      updateStatusError.message
    );
  }

  return {
    success: true,
    data: synthesis.data,
    ...(optimizedScore != null && { optimizedScore }),
  };
}

export interface GenerateOptimizedDocumentResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function downloadOptimizedDocument(
  analysisId: string,
  format: "pdf" | "docx"
): Promise<GenerateOptimizedDocumentResult> {
  return { success: false, error: "Não implementado ainda." };
}

export async function generateOptimizedDocument(
  analysisId: string,
  format: "pdf" | "docx",
  resumeData: ResumeData
): Promise<GenerateOptimizedDocumentResult> {
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
    .select("id")
    .eq("id", analysisId)
    .eq("user_id", user.id)
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
    console.error(
      "[generateOptimizedDocument] signedUrl for existing document:",
      signedError?.message
    );
  } else if (docLookupError) {
    console.error(
      "[generateOptimizedDocument] optimized_documents lookup error:",
      docLookupError.message
    );
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

  const filePath = `${user.id}/${analysisId}.${format}`;

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
    console.error(
      "[generateOptimizedDocument] upload error:",
      uploadError.message
    );
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
    console.error(
      "[generateOptimizedDocument] insert error:",
      insertError.message
    );
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN);

  if (signedError || !signedData?.signedUrl) {
    console.error(
      "[generateOptimizedDocument] signedUrl error:",
      signedError?.message
    );
    return {
      success: false,
      error: "Erro ao gerar link de download.",
    };
  }

  revalidatePath("/home");

  return {
    success: true,
    url: signedData.signedUrl,
  };
}
