import { logServerError } from "@/lib/logger";

const DEFAULT_USER_MESSAGE =
  "Algo deu errado. Tente novamente em alguns instantes.";

export const AI_OPERATIONS = [
  "extractResume",
  "refineResumeTexts",
  "extractJobSkills",
  "synthesizeSummary",
  "synthesizeHardSkillsByCategory",
  "synthesizeResumeContent",
] as const;

export type AiOperation = (typeof AI_OPERATIONS)[number];

const MESSAGES_BY_OPERATION: Record<AiOperation, string> = {
  extractResume: "Não foi possível extrair dados do documento.",
  refineResumeTexts: "Não foi possível melhorar os textos do currículo.",
  extractJobSkills: "Erro ao extrair skills da vaga.",
  synthesizeSummary: "Erro ao sintetizar resumo.",
  synthesizeHardSkillsByCategory:
    "Erro ao sintetizar categorias de hard skills.",
  synthesizeResumeContent: "Síntese de currículo falhou.",
};

export interface HandleAiErrorContext {
  operation: AiOperation;
  model?: string;
}

export function handleAiError(
  error: unknown,
  context: HandleAiErrorContext
): string {
  logServerError(
    {
      context: "ai",
      operation: context.operation,
      message: `Erro em operação de IA: ${context.operation}`,
      ...(context.model && { model: context.model }),
    },
    error
  );
  return MESSAGES_BY_OPERATION[context.operation] ?? DEFAULT_USER_MESSAGE;
}

export const AI_SERVICE_UNAVAILABLE_MESSAGE =
  "Serviço temporariamente indisponível.";
