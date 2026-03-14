import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ANTHROPIC_KEY = "ANTHROPIC_API_KEY";
const GOOGLE_AI_KEY = "GOOGLE_AI_API_KEY";

type AnthropicResult =
  | { ok: true; client: InstanceType<typeof Anthropic> }
  | { ok: false; error: string };
type GeminiResult =
  | { ok: true; client: GoogleGenerativeAI }
  | { ok: false; error: string };

let anthropicCache: AnthropicResult | undefined;
let geminiCache: GeminiResult | undefined;

export function getAnthropicClient(): AnthropicResult {
  if (anthropicCache === undefined) {
    const apiKey = process.env[ANTHROPIC_KEY];
    anthropicCache = apiKey
      ? { ok: true, client: new Anthropic({ apiKey }) }
      : { ok: false, error: `${ANTHROPIC_KEY} is not configured` };
  }
  return anthropicCache;
}

export function getGeminiClient(): GeminiResult {
  if (geminiCache === undefined) {
    const apiKey = process.env[GOOGLE_AI_KEY];
    geminiCache = apiKey
      ? { ok: true, client: new GoogleGenerativeAI(apiKey) }
      : { ok: false, error: `${GOOGLE_AI_KEY} is not configured` };
  }
  return geminiCache;
}
