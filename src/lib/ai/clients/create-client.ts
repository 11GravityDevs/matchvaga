import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const ANTHROPIC_KEY = "ANTHROPIC_API_KEY";
const OPENAI_KEY = "OPENAI_API_KEY";
const GOOGLE_AI_KEY = "GOOGLE_AI_API_KEY";

export function getAnthropicClient():
  | { ok: true; client: InstanceType<typeof Anthropic> }
  | { ok: false; error: string } {
  const apiKey = process.env[ANTHROPIC_KEY];
  if (!apiKey) {
    return { ok: false, error: `${ANTHROPIC_KEY} is not configured` };
  }
  return { ok: true, client: new Anthropic({ apiKey }) };
}

export function getOpenAIClient():
  | { ok: true; client: OpenAI }
  | { ok: false; error: string } {
  const apiKey = process.env[OPENAI_KEY];
  if (!apiKey) {
    return { ok: false, error: `${OPENAI_KEY} is not configured` };
  }
  return { ok: true, client: new OpenAI({ apiKey }) };
}

export function getGeminiClient():
  | { ok: true; client: GoogleGenerativeAI }
  | { ok: false; error: string } {
  const apiKey = process.env[GOOGLE_AI_KEY];
  if (!apiKey) {
    return { ok: false, error: `${GOOGLE_AI_KEY} is not configured` };
  }
  return { ok: true, client: new GoogleGenerativeAI(apiKey) };
}
