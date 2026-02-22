"use server";

import Anthropic from "@anthropic-ai/sdk";

import { SYNTHESIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/synthesis";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";

const MODEL = "claude-3-5-sonnet-20241022";

export interface SynthesisResult {
  success: true;
  data: ResumeData;
}

export interface SynthesisError {
  success: false;
  error: string;
}

export type SynthesisOutput = SynthesisResult | SynthesisError;

function buildUserPrompt(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: string[]
): string {
  return `Job: ${job.title} at ${job.company}

Job description:
${job.rawText}

---
Matched skills (emphasize these): ${matchedSkills.join(", ") || "none"}
Missing skills (weave in where truthful): ${missingSkills.join(", ") || "none"}

---
Current resume (JSON):
${JSON.stringify(resumeData, null, 2)}

Return the optimized resume as JSON with the same structure. Output only valid JSON.`;
}

export async function synthesizeOptimizedResume(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: string[]
): Promise<SynthesisOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { success: false, error: "ANTHROPIC_API_KEY is not configured" };
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYNTHESIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(
            resumeData,
            job,
            matchedSkills,
            missingSkills
          ),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const content =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!content) {
      return { success: false, error: "Resposta vazia do modelo." };
    }

    const trimmed = content.trim();
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
    const parsed = JSON.parse(jsonStr) as unknown;
    const validated = resumeDataSchema.parse(parsed);

    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Não foi possível interpretar o documento.",
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao gerar documento." };
  }
}
