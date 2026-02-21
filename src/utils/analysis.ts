export type ScoreFeedbackVariant = "success" | "warning" | "low";

export interface ScoreFeedback {
  label: string;
  variant: ScoreFeedbackVariant;
}

export function getScoreFeedback(score: number): ScoreFeedback {
  if (score >= 75)
    return {
      label: "Ótima Compatibilidade",
      variant: "success",
    };
  if (score >= 50)
    return {
      label: "Compatibilidade Razoável",
      variant: "warning",
    };
  return {
    label: "Precisa de Ajustes",
    variant: "low",
  };
}

export function getScoreColorToken(score: number): string {
  if (score >= 75) return "var(--accent-success)";
  if (score >= 50) return "var(--accent-warning)";
  return "var(--accent-low)";
}
