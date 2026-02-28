export interface MissingSkillsByCategory {
  technical: string[];
  behavioral: string[];
}

/** Build MissingSkillsByCategory from the two DB columns (after split). */
export function missingSkillsFromColumns(
  technical: unknown,
  behavioral: unknown
): MissingSkillsByCategory {
  return {
    technical: Array.isArray(technical) ? technical : [],
    behavioral: Array.isArray(behavioral) ? behavioral : [],
  };
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
