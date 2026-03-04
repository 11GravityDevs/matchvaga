import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
  SkillCategory,
} from "@/types/resume";

const PT_BR_MONTHS: Record<number, string> = {
  1: "Jan",
  2: "Fev",
  3: "Mar",
  4: "Abr",
  5: "Mai",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Set",
  10: "Out",
  11: "Nov",
  12: "Dez",
};

export function formatResumeDateBr(dateStr: string): string {
  if (!dateStr?.trim()) return "";

  const [year, month] = dateStr.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) return dateStr;
  return `${PT_BR_MONTHS[month]} ${year}`;
}

export function getFlattenedSkills(data: ResumeData): string[] {
  if (data.skillsByCategory && data.skillsByCategory.length > 0) {
    return data.skillsByCategory.flatMap((c) => c.items);
  }

  return data.skills ?? [];
}

export function getSkillsByCategoryForDisplay(
  data: ResumeData
): SkillCategory[] {
  if (data.skillsByCategory && data.skillsByCategory.length > 0) {
    return data.skillsByCategory;
  }
  if (data.skills && data.skills.length > 0) {
    return [{ category: "Habilidades", items: data.skills }];
  }
  return [];
}

export function formatLinkLabel(url: string): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "";
  return trimmed.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getContactLineForDisplay(data: ResumeData): string {
  const parts: string[] = [];
  if (data.location) parts.push(data.location);
  if (data.phone) parts.push(data.phone);
  if (data.linkedin) parts.push(formatLinkLabel(data.linkedin));
  if (data.github) parts.push(formatLinkLabel(data.github));
  if (data.email) parts.push(data.email);
  return parts.join(" | ");
}

const SORT_KEY_CURRENT = 9999 * 12 + 12;

export function parseResumeDateToSortKey(dateStr: string): number {
  const s = dateStr?.trim();
  if (!s) return 0;
  const parts = s.split("-").map(Number);
  const year = parts[0];
  if (!year || year < 1) return 0;
  const month = parts[1];
  if (month >= 1 && month <= 12) return year * 12 + month;
  return year * 12 + 12;
}

export function getExperienceSortKey(exp: ExperienceEntry): number {
  if (exp.isCurrent || !exp.endDate?.trim()) return SORT_KEY_CURRENT;
  const dateStr = exp.endDate.trim();
  return parseResumeDateToSortKey(dateStr);
}

export function getEducationSortKey(edu: EducationEntry): number {
  if (edu.isCurrent || !edu.completionDate?.trim()) return SORT_KEY_CURRENT;
  const dateStr = edu.completionDate.trim();
  return parseResumeDateToSortKey(dateStr);
}

export function sortExperienceByDateDesc(
  experience: ExperienceEntry[]
): ExperienceEntry[] {
  return experience
    .slice()
    .sort((a, b) => getExperienceSortKey(b) - getExperienceSortKey(a));
}

export function sortEducationByDateDesc(
  education: EducationEntry[]
): EducationEntry[] {
  return education
    .slice()
    .sort((a, b) => getEducationSortKey(b) - getEducationSortKey(a));
}
