import type { JobSkill } from "@/lib/ai/config/job-skills-schema";

export interface MissingSkillsByCategory {
  hard: string[];
  soft: string[];
}

export function sortMissingJobSkills(skills: JobSkill[]): JobSkill[] {
  return [...skills].sort((a, b) => {
    if (a.type !== b.type) return a.type === "required" ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

function jobSkillToLabel(s: unknown): string {
  if (
    s &&
    typeof s === "object" &&
    "name" in s &&
    typeof (s as { name: unknown }).name === "string"
  ) {
    return (s as { name: string }).name;
  }
  return "";
}

export function missingSkillsFromJobSkillColumns(
  missingHard: unknown,
  missingSoft: unknown
): MissingSkillsByCategory {
  const hard = Array.isArray(missingHard)
    ? (missingHard as unknown[]).map(jobSkillToLabel).filter(Boolean)
    : [];
  const soft = Array.isArray(missingSoft)
    ? (missingSoft as unknown[]).map(jobSkillToLabel).filter(Boolean)
    : [];
  return {
    hard,
    soft,
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

function skillPoints(skills: JobSkill[], isHard: boolean): number {
  return skills.reduce(
    (sum, s) =>
      sum +
      (isHard
        ? s.type === "required"
          ? 5
          : 2
        : s.type === "required"
          ? 3
          : 1),
    0
  );
}

export function calculateAtsScore(
  jobHardSkills: JobSkill[],
  jobSoftSkills: JobSkill[],
  missingHardSkills: JobSkill[],
  missingSoftSkills: JobSkill[]
): number {
  const totalPoints =
    skillPoints(jobHardSkills, true) + skillPoints(jobSoftSkills, false);
  if (totalPoints === 0) return 0;
  const missingPoints =
    skillPoints(missingHardSkills, true) +
    skillPoints(missingSoftSkills, false);
  return Math.max(
    0,
    Math.round(((totalPoints - missingPoints) / totalPoints) * 100)
  );
}

export function calculateMissingPoints(
  missingHardSkills: JobSkill[],
  missingSoftSkills: JobSkill[]
): number {
  return (
    skillPoints(missingHardSkills, true) + skillPoints(missingSoftSkills, false)
  );
}

export function calculateOptimizedScore(
  analysisScore: number,
  missingHard: JobSkill[],
  missingSoft: JobSkill[],
  mergedHardSkills: string[],
  mergedSoftSkills: string[]
): number {
  const hardSet = new Set(mergedHardSkills);
  const softSet = new Set(mergedSoftSkills);
  const stillMissingHard = missingHard.filter(
    (s) => !hardSet.has(s.original_term) && !hardSet.has(s.name)
  );
  const stillMissingSoft = missingSoft.filter(
    (s) => !softSet.has(s.original_term) && !softSet.has(s.name)
  );

  const originalMissingPoints = calculateMissingPoints(
    missingHard,
    missingSoft
  );
  const totalPoints =
    originalMissingPoints === 0
      ? 100
      : originalMissingPoints / (1 - analysisScore / 100);
  const optimizedMissingPoints = calculateMissingPoints(
    stillMissingHard,
    stillMissingSoft
  );

  if (totalPoints <= 0) return 0;
  return Math.max(
    0,
    Math.round(((totalPoints - optimizedMissingPoints) / totalPoints) * 100)
  );
}
