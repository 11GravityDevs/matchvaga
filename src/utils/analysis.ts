export interface MissingSkillsByCategory {
  technical: string[];
  behavioral: string[];
}

export function parseMissingSkillsFromDb(
  raw: unknown
): MissingSkillsByCategory {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("technical" in raw) ||
    !("behavioral" in raw)
  ) {
    return { technical: [], behavioral: [] };
  }
  const typed = raw as MissingSkillsByCategory;
  return {
    technical: Array.isArray(typed.technical) ? typed.technical : [],
    behavioral: Array.isArray(typed.behavioral) ? typed.behavioral : [],
  };
}
