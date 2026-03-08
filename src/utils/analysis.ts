export interface MissingSkillsByCategory {
  technical: string[];
  behavioral: string[];
}

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

export interface SkillsMatchPair {
  job_term: string;
  resume_term: string;
}

export interface ApplySkillsMatchResult {
  user_hard_skills: string[];
  user_soft_skills: string[];
}

export function applySkillsMatchToUserSkills(
  user_hard_skills: string[],
  user_soft_skills: string[],
  matches: SkillsMatchPair[]
): ApplySkillsMatchResult {
  const hard = [...user_hard_skills];
  const soft = [...user_soft_skills];

  const byResumeTerm = new Map<string, string[]>();

  for (const { resume_term, job_term } of matches) {
    const list = byResumeTerm.get(resume_term) ?? [];
    list.push(job_term);
    byResumeTerm.set(resume_term, list);
  }

  for (const [resume_term, job_terms] of byResumeTerm) {
    const idxHard = hard.indexOf(resume_term);
    if (idxHard >= 0) {
      hard[idxHard] = job_terms[0];
      hard.push(...job_terms.slice(1));
      continue;
    }

    const idxSoft = soft.indexOf(resume_term);
    if (idxSoft >= 0) {
      soft[idxSoft] = job_terms[0];
      soft.push(...job_terms.slice(1));
    }
  }

  return { user_hard_skills: hard, user_soft_skills: soft };
}
