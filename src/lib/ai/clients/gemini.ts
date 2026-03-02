"use server";

import { type Schema, GoogleGenerativeAI } from "@google/generative-ai";

import { resumeExtractionResponseSchema } from "@/lib/ai/config/resume-extraction-schema";
import { extractTextFromDocx } from "@/lib/document/extract-docx-text";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MIME_PDF = "application/pdf";
const MIME_DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ALLOWED_MIME_TYPES = [MIME_PDF, MIME_DOCX] as const;

export interface ExtractResumeResult {
  success: true;
  data: ResumeData;
}

export interface ExtractResumeError {
  success: false;
  error: string;
}

export type ExtractResumeOutput = ExtractResumeResult | ExtractResumeError;

export async function extractResumeFromFile(
  file: File
): Promise<ExtractResumeOutput> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GOOGLE_AI_API_KEY is not configured" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: "Arquivo muito grande. Máximo 2 MB." };
  }

  const mimeType = file.type;
  if (
    !ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return {
      success: false,
      error: "Formato não suportado. Use PDF ou DOCX.",
    };
  }

  const { RESUME_EXTRACTION_PROMPT } =
    await import("@/lib/ai/prompts/extraction");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: resumeExtractionResponseSchema as Schema,
    },
  });

  try {
    const arrayBuffer = await file.arrayBuffer();

    if (mimeType === MIME_DOCX) {
      const documentText = await extractTextFromDocx(arrayBuffer);
      const textPrompt = `Document text:\n\n${documentText}`;
      const result = await model.generateContent([
        { text: textPrompt },
        { text: RESUME_EXTRACTION_PROMPT },
      ]);

      return parseAndValidateResult(result);
    }

    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: MIME_PDF,
          data: base64,
        },
      },
      { text: RESUME_EXTRACTION_PROMPT },
    ]);

    return parseAndValidateResult(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Não foi possível extrair dados do documento.",
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao processar currículo." };
  }
}

function parseAndValidateResult(
  result: Awaited<
    ReturnType<
      ReturnType<GoogleGenerativeAI["getGenerativeModel"]>["generateContent"]
    >
  >
): ExtractResumeOutput {
  const response = result.response;
  const text = response.text();

  if (!text) {
    return { success: false, error: "Resposta vazia do modelo." };
  }

  try {
    const parsed = JSON.parse(text.trim()) as unknown;
    const validated = resumeDataSchema.parse(parsed);
    return { success: true, data: validated };
  } catch {
    return {
      success: false,
      error: "Não foi possível extrair dados do documento.",
    };
  }
}
