const MIN_LENGTH = 300;

const JOB_RELATED_KEYWORDS = [
  "candidat",
  "requisit",
  "experiência",
  "experiencia",
  "responsabilidade",
  "vaga",
  "cargo",
  "descrição",
  "descricao",
  "benefício",
  "beneficio",
  "empresa",
  "requirements",
  "candidate",
  "position",
  "role",
  "qualification",
  "habilidade",
  "skill",
  "atribuição",
  "atribuicao",
] as const;

export const NOT_JOB_DESCRIPTION_MESSAGE =
  "Não foi possível identificar informações da vaga. Cole a descrição completa da vaga.";

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export interface JobDescriptionValidationResult {
  valid: boolean;
}

export function validateJobDescriptionText(
  text: string
): JobDescriptionValidationResult {
  const trimmed = text.trim();
  if (trimmed.length < MIN_LENGTH) {
    return { valid: false };
  }

  return { valid: true };

  const normalized = normalizeForMatch(trimmed);
  const hasKeyword = JOB_RELATED_KEYWORDS.some((kw) =>
    normalized.includes(normalizeForMatch(kw))
  );

  return { valid: hasKeyword };
}
