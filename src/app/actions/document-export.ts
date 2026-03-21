"use server";

import { buildResumeDocx } from "@/lib/document/resume-to-docx";
import { ResumeDocument } from "@/lib/document/resume-to-pdf";
import { logServerError } from "@/lib/logger";
import {
  getAuthenticatedUser,
  type GetAuthenticatedUserSuccess,
} from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/service";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { renderToBuffer } from "@react-pdf/renderer";
import { revalidatePath } from "next/cache";
import { createElement } from "react";

const BUCKET = "documents";
const SIGNED_URL_EXPIRES_IN = 3600;
const MAX_OPTIMIZED_DOCUMENT_BYTES = 10 * 1024 * 1024;

export interface GenerateOptimizedDocumentResult {
  success: boolean;
  url?: string;
  error?: string;
}

type SupabaseServer = GetAuthenticatedUserSuccess["supabase"];

async function generateOptimizedDocumentWithContext(
  readSupabase: SupabaseServer,
  userId: string,
  analysisId: string,
  format: "pdf" | "docx",
  resumeData: ResumeData
): Promise<GenerateOptimizedDocumentResult> {
  const { data: analysisRow, error: analysisError } = await readSupabase
    .from("analyses")
    .select("id, status")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .single();

  if (analysisError || !analysisRow) {
    return { success: false, error: "Análise não encontrada." };
  }

  if (analysisRow.status !== "completed") {
    return {
      success: false,
      error: "Conclua o desbloqueio desta análise antes de baixar o documento.",
    };
  }

  const { data: existingDoc, error: docLookupError } = await readSupabase
    .from("optimized_documents")
    .select("file_path")
    .eq("analysis_id", analysisId)
    .eq("format", format)
    .maybeSingle();

  if (!docLookupError && existingDoc?.file_path) {
    const { data: signedData, error: signedError } = await readSupabase.storage
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
    const docElement = createElement(ResumeDocument, {
      data: validResumeData,
    });
    buffer = await renderToBuffer(
      docElement as Parameters<typeof renderToBuffer>[0]
    );
  } else {
    buffer = await buildResumeDocx(validResumeData);
  }

  if (buffer.length > MAX_OPTIMIZED_DOCUMENT_BYTES) {
    return {
      success: false,
      error: "Documento gerado excede o tamanho máximo permitido.",
    };
  }

  const filePath = `${userId}/${analysisId}.${format}`;
  const adminSupabase = createAdminSupabaseClient();

  const { error: uploadError } = await adminSupabase.storage
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
      error: "Erro ao salvar documento. Tente novamente.",
    };
  }

  const { error: insertError } = await adminSupabase
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
    const { error: rollbackRemoveError } = await adminSupabase.storage
      .from(BUCKET)
      .remove([filePath]);
    if (rollbackRemoveError) {
      logServerError({
        context: "db",
        operation: "generateOptimizedDocument_insert_rollback_upload",
        message: rollbackRemoveError.message,
      });
    }
    return {
      success: false,
      error: "Erro ao registrar documento. Tente novamente.",
    };
  }

  const { data: signedData, error: signedError } = await readSupabase.storage
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
    .select("id, status, optimized_resume_data")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (analysisError || !analysisRow) {
    return { success: false, error: "Análise não encontrada." };
  }

  if (analysisRow.status !== "completed") {
    return {
      success: false,
      error: "Conclua o desbloqueio desta análise antes de baixar o documento.",
    };
  }

  const optimizedParsed =
    analysisRow.optimized_resume_data != null
      ? resumeDataSchema.safeParse(analysisRow.optimized_resume_data)
      : null;

  if (!optimizedParsed?.success) {
    return {
      success: false,
      error:
        "Conclua a otimização do currículo nesta análise antes de baixar o documento.",
    };
  }

  return generateOptimizedDocumentWithContext(
    supabase,
    user.id,
    analysisId,
    format,
    optimizedParsed.data as ResumeData
  );
}
