import type { JobSkill } from "@/lib/ai/config/job-skills-schema";
import type { ResumeData } from "@/types/resume";

export type JobSnapshot =
  | { title?: string; company?: string }
  | null
  | undefined;

export function selectedLabelsToOriginalTerms(
  selectedLabels: string[],
  skills: JobSkill[]
): string[] {
  const byName = new Map(
    skills.map((skill) => [skill.name, skill.original_term])
  );
  return selectedLabels
    .map((label) => byName.get(label) ?? label)
    .filter(Boolean);
}

export function mergeUniqueSkills(
  current: string[],
  selected: string[]
): string[] {
  return [...current, ...selected.filter((skill) => !current.includes(skill))];
}

export function createSynthesisParams(
  resumeData: ResumeData,
  hardSkills: string[],
  softSkills: string[],
  jobSnapshot: JobSnapshot
) {
  return {
    summary: resumeData.summary,
    hardSkills,
    softSkills,
    jobTitle: jobSnapshot?.title ?? undefined,
  };
}

export function buildMergedResumeData(
  resumeData: ResumeData,
  synthesisData: {
    summary: string;
    hardSkillsByCategory: ResumeData["hardSkillsByCategory"];
  }
): ResumeData {
  return {
    ...resumeData,
    summary: synthesisData.summary,
    hardSkillsByCategory: synthesisData.hardSkillsByCategory,
  };
}
