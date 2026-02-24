import type { ResumeData, SkillCategory } from "@/types/resume";

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
