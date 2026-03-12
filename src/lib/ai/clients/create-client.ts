import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const ANTHROPIC_KEY = "ANTHROPIC_API_KEY";
const OPENAI_KEY = "OPENAI_API_KEY";
const GOOGLE_AI_KEY = "GOOGLE_AI_API_KEY";

type AnthropicResult =
  | { ok: true; client: InstanceType<typeof Anthropic> }
  | { ok: false; error: string };
type OpenAIResult = { ok: true; client: OpenAI } | { ok: false; error: string };
type GeminiResult =
  | { ok: true; client: GoogleGenerativeAI }
  | { ok: false; error: string };

let anthropicCache: AnthropicResult | undefined;
let openaiCache: OpenAIResult | undefined;
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

export function getOpenAIClient(): OpenAIResult {
  if (openaiCache === undefined) {
    const apiKey = process.env[OPENAI_KEY];
    openaiCache = apiKey
      ? { ok: true, client: new OpenAI({ apiKey }) }
      : { ok: false, error: `${OPENAI_KEY} is not configured` };
  }
  return openaiCache;
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
