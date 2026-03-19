import type { GoogleGenAI } from "@google/genai";

import { getGeminiClient } from "@/lib/ai/clients/create-client";
import {
  refineResumeTextsResponseSchema,
  refineResumeTextsResponseZodSchema,
} from "@/lib/ai/config/refine-resume-texts-schema";
import { resumeExtractionResponseSchema } from "@/lib/ai/config/resume-extraction-schema";
import { handleAiError } from "@/lib/ai/errors";
import {
  RESUME_SYSTEM_INSTRUCTION,
  RESUME_USER_PROMPT,
} from "@/lib/ai/prompts/extraction";
import {
  REFINE_TEXTS_SYSTEM_INSTRUCTION,
  REFINE_TEXTS_USER_PROMPT_PREFIX,
} from "@/lib/ai/prompts/refine-resume-texts";
import { extractTextFromDocx } from "@/lib/document/extract-docx-text";
import {
  MIME_PDF,
  MIME_DOCX,
  validateResumeFile,
} from "@/lib/document/validate-resume-file";
import { logServerError } from "@/lib/logger";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import {
  capitalizeResumeData,
  truncateResumeDataToLimits,
} from "@/utils/resume";

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
const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash";

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

interface ExtractResumeWithModelInput {
  arrayBuffer: ArrayBuffer;
  mimeType: string;
}

async function extractResumeWithModel(
  genAI: GoogleGenAI,
  modelName: string,
  { arrayBuffer, mimeType }: ExtractResumeWithModelInput
): Promise<ExtractResumeOutput> {
  const thinkingConfig =
    modelName === GEMINI_FALLBACK_MODEL ? { thinkingBudget: 512 } : undefined;

  const config = {
    systemInstruction: RESUME_SYSTEM_INSTRUCTION,
    temperature: 0,
    responseMimeType: "application/json",
    responseJsonSchema: resumeExtractionResponseSchema,
    ...(thinkingConfig ? { thinkingConfig } : {}),
  };

  try {
    if (mimeType === MIME_DOCX) {
      const documentText = await extractTextFromDocx(arrayBuffer);
      const textPrompt = `Você está recebendo o currículo como texto.\n\nTexto do documento:\n\n${documentText}`;
      const combinedUserMessage = `${textPrompt}\n\n${RESUME_USER_PROMPT}`;

      const response = await genAI.models.generateContent({
        model: modelName,
        contents: combinedUserMessage,
        config,
      });

      return parseAndValidateResult(response.text, modelName);
    }

    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const userPromptWithContext = `Você está recebendo o currículo em formato PDF.\n\n${RESUME_USER_PROMPT}`;

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: MIME_PDF,
                data: base64,
              },
            },
            { text: userPromptWithContext },
          ],
        },
      ],
      config,
    });

    return parseAndValidateResult(response.text, modelName);
  } catch (error) {
    const userMessage = handleAiError(error, {
      operation: "extractResume",
      model: modelName,
    });
    return { success: false, error: userMessage };
  }
}

export async function extractResumeFromFile(
  file: File
): Promise<ExtractResumeOutput> {
  const geminiResult = getGeminiClient();
  if (!geminiResult.ok) return { success: false, error: geminiResult.error };
  const genAI = geminiResult.client;

  const fileValidation = await validateResumeFile(file);
  if (!fileValidation.valid) {
    return { success: false, error: fileValidation.error };
  }

  const { arrayBuffer, mimeType } = fileValidation;

  const extraction = await extractResumeWithModel(genAI, GEMINI_MODEL, {
    arrayBuffer,
    mimeType,
  });

  if (extraction.success) {
    return extraction;
  }

  logServerError(
    {
      context: "ai",
      operation: "extractResume",
      message: "Fallback para Gemini 2.5 Flash após falha do Lite.",
      model: GEMINI_FALLBACK_MODEL,
    },
    new Error(extraction.error)
  );

  return extractResumeWithModel(genAI, GEMINI_FALLBACK_MODEL, {
    arrayBuffer,
    mimeType,
  });
}

function parseAndValidateResult(
  text: string | undefined,
  modelName: string = GEMINI_MODEL
): ExtractResumeOutput {
  if (!text?.trim()) {
    return { success: false, error: "Resposta vazia do modelo." };
  }

  try {
    const parsed = JSON.parse(text.trim()) as unknown;
    const normalizedSkills = normalizeExtractedSkills(parsed);
    const truncated = truncateResumeDataToLimits(normalizedSkills);
    const validated = resumeDataSchema.safeParse(truncated);
    if (!validated.success) {
      const userMessage = handleAiError(validated.error, {
        operation: "extractResume",
        model: modelName,
      });
      return { success: false, error: userMessage };
    }
    return { success: true, data: capitalizeResumeData(validated.data) };
  } catch (error) {
    const userMessage = handleAiError(error, {
      operation: "extractResume",
      model: modelName,
    });
    return { success: false, error: userMessage };
  }
}

export async function refineResumeTexts(data: ResumeData): Promise<ResumeData> {
  const result = getGeminiClient();
  if (!result.ok) {
    return data;
  }

  const hasSummary = data.summary.trim().length > 0;
  const hasExperienceDescriptions = data.experience.some(
    (e) => e.description.trim().length > 0
  );
  const hasEducationDescriptions = data.education.some(
    (e) => (e.description ?? "").trim().length > 0
  );
  if (!hasSummary && !hasExperienceDescriptions && !hasEducationDescriptions) {
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

  const userMessage = `${REFINE_TEXTS_USER_PROMPT_PREFIX}${JSON.stringify(inputPayload)}`;

  try {
    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: userMessage,
      config: {
        systemInstruction: REFINE_TEXTS_SYSTEM_INSTRUCTION,
        temperature: 0.5,
        responseMimeType: "application/json",
        responseJsonSchema: refineResumeTextsResponseSchema,
      },
    });

    const text = response.text;
    if (!text?.trim()) return data;

    const parsed = JSON.parse(text.trim()) as unknown;
    const refinedResult = refineResumeTextsResponseZodSchema.safeParse(parsed);
    if (!refinedResult.success) {
      logServerError(
        {
          context: "ai",
          operation: "refineResumeTexts",
          message: "Validação Zod falhou na resposta de refinamento.",
          model: GEMINI_MODEL,
        },
        refinedResult.error
      );
      return data;
    }
    const refined = refinedResult.data;

    const expById = new Map(
      refined.experienceDescriptions.map((item) => [item.id, item.description])
    );
    const eduById = new Map(
      refined.educationDescriptions.map((item) => [item.id, item.description])
    );

    const expectedExpIds = data.experience.length;
    const expectedEduIds = data.education.length;
    if (expById.size !== expectedExpIds || eduById.size !== expectedEduIds) {
      logServerError(
        {
          context: "ai",
          operation: "refineResumeTexts",
          message:
            "Resposta com quantidade de ids diferente do esperado; usando dados originais.",
          model: GEMINI_MODEL,
        },
        new Error(
          `Expected ${expectedExpIds} exp, ${expectedEduIds} edu; got ${expById.size}, ${eduById.size}`
        )
      );
      return data;
    }

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
    handleAiError(error, {
      operation: "refineResumeTexts",
      model: GEMINI_MODEL,
    });
    return data;
  }
}
