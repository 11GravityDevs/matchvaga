"use server";

import Anthropic from "@anthropic-ai/sdk";

import { normalizeAIResumeData } from "@/lib/ai/utils/normalize-resume";
import { SYNTHESIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/synthesis";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";

const MODEL = "claude-haiku-4-5-20251001";

export interface SynthesisResult {
  success: true;
  data: ResumeData;
}

export interface SynthesisError {
  success: false;
  error: string;
}

export type SynthesisOutput = SynthesisResult | SynthesisError;

function buildMissingSkillsBlock(
  missing:
    | {
        technical: string[];
        behavioral: string[];
      }
    | undefined
): string {
  if (!missing) {
    return "Missing skills: none — do not add any skills beyond the matched skills list above.";
  }
  const { technical, behavioral } = missing;
  const hasTechnical = technical.length > 0;
  const hasBehavioral = behavioral.length > 0;

  if (!hasTechnical && !hasBehavioral) {
    return "Missing skills: none — do not add any skills beyond the matched skills list above.";
  }

  const lines: string[] = [];

  if (hasTechnical) {
    lines.push(
      `Missing technical skills (weave in where truthful): ${technical.join(", ")}`
    );
  }

  if (hasBehavioral) {
    lines.push(
      `Missing behavioral skills (weave in where truthful): ${behavioral.join(", ")}`
    );
  }

  return lines.join("\n");
}

function buildUserPrompt(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: { technical: string[]; behavioral: string[] } | undefined
): string {
  return `Job: ${job.title} at ${job.company}

Job description:
${job.rawText}

---
Matched skills (emphasize these): ${matchedSkills.join(", ") || "none"}
${buildMissingSkillsBlock(missingSkills)}

---
Current resume (JSON):
${JSON.stringify(resumeData, null, 2)}

Return the optimized resume as JSON. Include skillsByCategory (array of { category, items }), skills (flat array), and all other fields. Experience and education descriptions: one bullet per line. Output only valid JSON.`;
}

export async function synthesizeOptimizedResume(
  resumeData: ResumeData,
  job: { title: string; company: string; rawText: string },
  matchedSkills: string[],
  missingSkills: { technical: string[]; behavioral: string[] } | undefined
): Promise<SynthesisOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { success: false, error: "ANTHROPIC_API_KEY is not configured" };
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
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
    const normalized = normalizeAIResumeData(parsed);
    const validated = resumeDataSchema.parse(normalized);

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
