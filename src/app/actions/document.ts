"use server";

import React from "react";
import { revalidatePath } from "next/cache";
import ReactPDF from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { synthesizeOptimizedResume } from "@/lib/ai/clients/anthropic";
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

  const { error: updateStatusError } = await supabase
    .from("analyses")
    .update({ status: "completed" })
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
  };
}

export interface GenerateOptimizedDocumentResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function generateOptimizedDocument(
  analysisId: string,
  format: "pdf" | "docx",
  selectedTechnicalSkills?: string[],
  selectedBehavioralSkills?: string[]
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

  let buffer: Buffer;

  if (format === "pdf") {
    const docElement = React.createElement(ResumeDocument, {
      data: synthesis.data,
    });
    buffer = await ReactPDF.renderToBuffer(
      docElement as Parameters<typeof ReactPDF.renderToBuffer>[0]
    );
  } else {
    buffer = await buildResumeDocx(synthesis.data);
  }

  const ext = format;
  const filePath = `${user.id}/${analysisId}.${ext}`;

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
    return {
      success: false,
      error: "Erro ao registrar documento.",
    };
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

  revalidatePath("/dashboard");

  return {
    success: true,
    url: signedData.signedUrl,
  };
}
