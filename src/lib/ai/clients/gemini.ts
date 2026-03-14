import { type Schema, GoogleGenerativeAI } from "@google/generative-ai";

import { getGeminiClient } from "@/lib/ai/clients/create-client";
import {
  refineResumeTextsResponseSchema,
  refineResumeTextsResponseZodSchema,
} from "@/lib/ai/config/refine-resume-texts-schema";
import { resumeExtractionResponseSchema } from "@/lib/ai/config/resume-extraction-schema";
import { logServerError } from "@/lib/logger";
import { extractTextFromDocx } from "@/lib/document/extract-docx-text";
import { resumeDataSchema } from "@/schemas/resume";
import {
  capitalizeResumeData,
  truncateResumeDataToLimits,
} from "@/utils/resume";
import type { ResumeData } from "@/types/resume";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
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

const GEMINI_MODEL = "gemini-2.5-flash-lite";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanSkillToken(token: string): string {
  const normalizedToken = normalizeWhitespace(token)
    .replace(/^[-*•·]\s*/, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^[([{]+|[)\]}]+$/g, "")
    .replace(/[.,;:]+$/g, "");

  return normalizeWhitespace(normalizedToken);
}

function splitByConnectors(token: string): string[] {
  const normalizedToken = normalizeWhitespace(token);
  if (!/\s(?:e|and)\s/i.test(normalizedToken)) {
    return [normalizedToken];
  }

  const parts = normalizedToken
    .split(/\s(?:e|and)\s/i)
    .map((part) => normalizeWhitespace(part))
    .filter((part) => part.length > 0);

  if (parts.length < 2) {
    return [normalizedToken];
  }

  return parts;
}

function splitSkillItem(skill: string): string[] {
  const normalizedSkill = normalizeWhitespace(skill);
  if (!normalizedSkill) {
    return [];
  }

  const parentheticalSegments = Array.from(
    normalizedSkill.matchAll(/\(([^()]+)\)/g),
    (match) => normalizeWhitespace(match[1] ?? "")
  ).filter((segment) => segment.length > 0);

  const outsideParentheses = normalizeWhitespace(
    normalizedSkill.replace(/\([^()]*\)/g, " ")
  );

  const baseSegments = [outsideParentheses, ...parentheticalSegments].filter(
    (segment) => segment.length > 0
  );

  const delimiterSplitPattern = /[\n,;|•·]+|\s+-\s+|\s\/\s+/;
  const splitTokens = baseSegments.flatMap((segment) =>
    segment
      .split(delimiterSplitPattern)
      .map((part) => normalizeWhitespace(part))
      .filter((part) => part.length > 0)
  );

  return splitTokens
    .flatMap((token) => splitByConnectors(token))
    .map((token) => token.replace(/^.+?:\s*/, ""))
    .map((token) => cleanSkillToken(token))
    .filter((token) => token.length > 0);
}

function normalizeSkillList(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const uniqueSkills = new Set<string>();
  const normalizedSkills: string[] = [];

  for (const item of input) {
    if (typeof item !== "string") {
      continue;
    }

    for (const token of splitSkillItem(item)) {
      const key = token.toLocaleLowerCase("pt-BR");
      if (uniqueSkills.has(key)) {
        continue;
      }

      uniqueSkills.add(key);
      normalizedSkills.push(token);
    }
  }

  return normalizedSkills;
}

function normalizeExtractedSkills(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") {
    return parsed;
  }

  const parsedObject = parsed as Record<string, unknown>;

  return {
    ...parsedObject,
    hardSkills: normalizeSkillList(parsedObject.hardSkills),
    softSkills: normalizeSkillList(parsedObject.softSkills),
  };
}

export async function extractResumeFromFile(
  file: File
): Promise<ExtractResumeOutput> {
  const result = getGeminiClient();
  if (!result.ok) return { success: false, error: result.error };
  const genAI = result.client;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: "Arquivo muito grande. Máximo 5 MB." };
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

  const { RESUME_SYSTEM_INSTRUCTION, RESUME_USER_PROMPT } =
    await import("@/lib/ai/prompts/extraction");

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: RESUME_SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: resumeExtractionResponseSchema as Schema,
      temperature: 0,
    },
  });

  try {
    const arrayBuffer = await file.arrayBuffer();

    if (mimeType === MIME_DOCX) {
      const documentText = await extractTextFromDocx(arrayBuffer);
      const textPrompt = `Você está recebendo o currículo como texto.\n\nTexto do documento:\n\n${documentText}`;
      const result = await model.generateContent([
        { text: textPrompt },
        { text: RESUME_USER_PROMPT },
      ]);

      return parseAndValidateResult(result);
    }

    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const userPromptWithContext = `Você está recebendo o currículo em formato PDF.\n\n${RESUME_USER_PROMPT}`;
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: MIME_PDF,
          data: base64,
        },
      },
      { text: userPromptWithContext },
    ]);

    return parseAndValidateResult(result);
  } catch (error) {
    logServerError(
      {
        context: "ai",
        operation: "extractResume",
        message: "Extração de currículo falhou.",
        model: GEMINI_MODEL,
      },
      error
    );
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
    const normalizedSkills = normalizeExtractedSkills(parsed);
    const truncated = truncateResumeDataToLimits(normalizedSkills);
    const validated = resumeDataSchema.parse(truncated);
    return { success: true, data: capitalizeResumeData(validated) };
  } catch {
    return {
      success: false,
      error: "Não foi possível extrair dados do documento.",
    };
  }
}

export async function refineResumeTexts(data: ResumeData): Promise<ResumeData> {
  const result = getGeminiClient();
  if (!result.ok) {
    return data;
  }
  const genAI = result.client;

  const inputPayload = {
    summary: data.summary,
    experienceDescriptions: data.experience.map((e, i) => ({
      id: `exp${i}`,
      jobTitle: e.jobTitle,
      company: e.company,
      description: e.description,
    })),
    educationDescriptions: data.education.map((e, i) => ({
      id: `edu${i}`,
      institution: e.institution,
      course: e.course,
      description: e.description ?? "",
    })),
  };

  const { REFINE_TEXTS_SYSTEM_INSTRUCTION, REFINE_TEXTS_USER_PROMPT_PREFIX } =
    await import("@/lib/ai/prompts/refine-resume-texts");

  const userMessage = `${REFINE_TEXTS_USER_PROMPT_PREFIX}${JSON.stringify(inputPayload)}`;

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: REFINE_TEXTS_SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: refineResumeTextsResponseSchema as unknown as Schema,
      temperature: 0.3,
    },
  });

  try {
    const generateResult = await model.generateContent([{ text: userMessage }]);
    const response = generateResult.response;
    const text = response.text();

    if (!text) {
      return data;
    }

    const parsed = JSON.parse(text.trim()) as unknown;
    const refined = refineResumeTextsResponseZodSchema.parse(parsed);

    const expById = new Map(
      refined.experienceDescriptions.map((item) => [item.id, item.description])
    );
    const eduById = new Map(
      refined.educationDescriptions.map((item) => [item.id, item.description])
    );

    return {
      ...data,
      summary: refined.summary,
      experience: data.experience.map((entry, i) => {
        const id = `exp${i}`;
        const refinedDesc = expById.get(id);
        return {
          ...entry,
          description: refinedDesc ?? entry.description,
        };
      }),
      education: data.education.map((entry, i) => {
        const id = `edu${i}`;
        const refinedDesc = eduById.get(id);
        return {
          ...entry,
          description:
            refinedDesc !== undefined ? refinedDesc : entry.description,
        };
      }),
    };
  } catch (error) {
    logServerError(
      {
        context: "ai",
        operation: "refineResumeTexts",
        message:
          "Refinamento de textos do currículo falhou; usando dados originais.",
        model: GEMINI_MODEL,
      },
      error
    );
    return data;
  }
}
