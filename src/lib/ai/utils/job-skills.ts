import type { JobSkill } from "@/lib/ai/config/job-skills-schema";

export const JOB_SKILLS_LANGUAGE_TERMS = new Set([
  "inglês",
  "ingles",
  "english",
  "espanhol",
  "spanish",
  "português",
  "portugues",
  "portuguese",
  "francês",
  "frances",
  "french",
  "mandarim",
  "chinês",
  "chines",
  "chinese",
  "japonês",
  "japones",
  "japanese",
  "alemão",
  "alemao",
  "german",
  "italiano",
  "italian",
  "coreano",
  "korean",
  "russo",
  "russian",
]);

export function isLanguageSkill(skill: JobSkill): boolean {
  const name = skill.name.toLowerCase().trim();
  const term = skill.original_term.toLowerCase().trim();
  return (
    JOB_SKILLS_LANGUAGE_TERMS.has(name) || JOB_SKILLS_LANGUAGE_TERMS.has(term)
  );
}
