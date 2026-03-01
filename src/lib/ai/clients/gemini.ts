"use server";

import { type Schema, GoogleGenerativeAI } from "@google/generative-ai";

import { resumeExtractionResponseSchema } from "@/lib/ai/config/resume-extraction-schema";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
] as const;

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

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: resumeExtractionResponseSchema as Schema,
      },
    });

    const { RESUME_EXTRACTION_PROMPT } =
      await import("@/lib/ai/prompts/extraction");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      { text: RESUME_EXTRACTION_PROMPT },
    ]);

    const response = result.response;
    const text = response.text();

    if (!text) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    const parsed = JSON.parse(text.trim()) as unknown;
    const validated = resumeDataSchema.parse(parsed);

    return { success: true, data: validated };
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
