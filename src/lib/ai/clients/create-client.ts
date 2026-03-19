import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

import { AI_SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/ai/errors";
import { logServerError } from "@/lib/logger";

const ANTHROPIC_KEY = "ANTHROPIC_API_KEY";
const GOOGLE_AI_KEY = "GOOGLE_AI_API_KEY";

type AnthropicResult =
  | { ok: true; client: InstanceType<typeof Anthropic> }
  | { ok: false; error: string };
type GeminiResult =
  | { ok: true; client: GoogleGenAI }
  | { ok: false; error: string };

let anthropicCache: AnthropicResult | undefined;
let geminiCache: GeminiResult | undefined;

export function getAnthropicClient(): AnthropicResult {
  if (anthropicCache === undefined) {
    const apiKey = process.env[ANTHROPIC_KEY];
    if (!apiKey) {
      logServerError({
        context: "ai",
        operation: "getAnthropicClient",
        message: `${ANTHROPIC_KEY} is not configured`,
      });
      anthropicCache = { ok: false, error: AI_SERVICE_UNAVAILABLE_MESSAGE };
    } else {
      anthropicCache = { ok: true, client: new Anthropic({ apiKey }) };
    }
  }
  return anthropicCache;
}

export function getGeminiClient(): GeminiResult {
  if (geminiCache === undefined) {
    const apiKey = process.env[GOOGLE_AI_KEY];
    if (!apiKey) {
      logServerError({
        context: "ai",
        operation: "getGeminiClient",
        message: `${GOOGLE_AI_KEY} is not configured`,
      });
      geminiCache = { ok: false, error: AI_SERVICE_UNAVAILABLE_MESSAGE };
    } else {
      geminiCache = { ok: true, client: new GoogleGenAI({ apiKey }) };
    }
  }
  return geminiCache;
}
