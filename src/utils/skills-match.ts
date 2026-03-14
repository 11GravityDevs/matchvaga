import { jobSkillsResponseSchema } from "@/lib/ai/config/job-skills-schema";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { getFlattenedSkills } from "@/utils/resume";
import stringSimilarity from "string-similarity";
import { z } from "zod";

const jobSkillsInputSchema = jobSkillsResponseSchema.omit({
  is_job_description: true,
});

export const SIMILARITY_THRESHOLD = 0.75;

export interface SkillsMatchPair {
  job_term: string;
  resume_term: string;
}

interface ResumeIndex {
  byNormalized: Map<string, string>;
  normalizedKeys: string[];
}

export function normalizeTerm(s: string): string {
  const trimmed = s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\./g, " ")
    .toLowerCase();
  return trimmed
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function tokenSet(value: string): Set<string> {
  const normalized = normalizeTerm(value);
  const tokens = normalized.split(" ").filter((t) => t.length > 0);
  return new Set(tokens);
}

function hasTokenOverlap(jobNorm: string, resumeNorm: string): boolean {
  const jobTokens = tokenSet(jobNorm);
  const resumeTokens = tokenSet(resumeNorm);
  if (jobTokens.size === 0) return false;
  for (const t of jobTokens) {
    if (!resumeTokens.has(t)) return false;
  }
  return true;
}

function buildResumeIndex(resumeTerms: string[]): ResumeIndex {
  const byNormalized = new Map<string, string>();
  for (const term of resumeTerms) {
    const norm = normalizeTerm(term);
    if (!byNormalized.has(norm)) byNormalized.set(norm, term);
  }
  return {
    byNormalized,
    normalizedKeys: Array.from(byNormalized.keys()),
  };
}

function findMatchBySimilarity(
  jobNorm: string,
  index: ResumeIndex
): string | null {
  if (index.normalizedKeys.length === 0) return null;
  const { bestMatch } = stringSimilarity.findBestMatch(
    jobNorm,
    index.normalizedKeys
  );
  if (bestMatch.rating < SIMILARITY_THRESHOLD) return null;
  return index.byNormalized.get(bestMatch.target) ?? null;
}

export function matchSkillsBySimilarity(
  jobTerms: string[],
  resumeTerms: string[]
): SkillsMatchPair[] {
  const index = buildResumeIndex(resumeTerms);
  const pairs: SkillsMatchPair[] = [];

  for (const jobTerm of jobTerms) {
    const jobNorm = normalizeTerm(jobTerm);
    if (jobNorm.length === 0) continue;

    const matchedResume =
      index.byNormalized.get(jobNorm) ??
      findTokenOverlapMatch(jobNorm, index) ??
      findMatchBySimilarity(jobNorm, index);

    if (matchedResume) {
      pairs.push({ job_term: jobTerm, resume_term: matchedResume });
    }
  }

  return pairs;
}

function findTokenOverlapMatch(
  jobNorm: string,
  index: ResumeIndex
): string | null {
  for (const [resumeNorm, original] of index.byNormalized) {
    if (hasTokenOverlap(jobNorm, resumeNorm)) return original;
  }
  return null;
}

export type JobSkillsInput = z.infer<typeof jobSkillsInputSchema>;

export interface MatchSkillsResult {
  success: true;
  data: SkillsMatchPair[];
}

export interface MatchSkillsError {
  success: false;
  error: string;
}

export type MatchSkillsOutput = MatchSkillsResult | MatchSkillsError;

export async function matchJobSkillsToResume(
  jobSkills: JobSkillsInput,
  resumeData: ResumeData
): Promise<MatchSkillsOutput> {
  const jobParsed = jobSkillsInputSchema.safeParse(jobSkills);
  const resumeParsed = resumeDataSchema.safeParse(resumeData);

  if (!jobParsed.success) {
    return { success: false, error: "Habilidades da vaga inválidas." };
  }
  if (!resumeParsed.success) {
    return { success: false, error: "Dados do currículo inválidos." };
  }

  const jobTerms = [
    ...jobParsed.data.hard_skills.map((s) => s.original_term),
    ...jobParsed.data.soft_skills.map((s) => s.original_term),
  ];
  const resumeTerms = getFlattenedSkills(resumeParsed.data);

  const matches = matchSkillsBySimilarity(jobTerms, resumeTerms);
  return { success: true, data: matches };
}
