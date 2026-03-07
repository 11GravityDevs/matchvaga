import { RESUME_LIMITS } from "@/constants/resume";
import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
  SkillCategory,
} from "@/types/resume";

function normalizeMonthYearValue(value: string): string {
  const v = value.trim();
  if (/^\d{4}$/.test(v)) return `${v}-01`;
  return value;
}

export function normalizeResumeDates(data: ResumeData): ResumeData {
  return {
    ...data,
    experience: data.experience.map((exp) => ({
      ...exp,
      startDate: normalizeMonthYearValue(exp.startDate),
      endDate: normalizeMonthYearValue(exp.endDate),
    })),
    education: data.education.map((edu) => ({
      ...edu,
      startDate: normalizeMonthYearValue(edu.startDate),
      completionDate: normalizeMonthYearValue(edu.completionDate),
    })),
  };
}

export function truncateResumeDataToLimits(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;

  const o = obj as Record<string, unknown>;

  const truncateStr = (s: unknown, max: number): string => {
    if (typeof s !== "string") return "";

    return s.slice(0, max);
  };

  const experience = Array.isArray(o.experience)
    ? o.experience.slice(0, RESUME_LIMITS.EXPERIENCE_MAX).map((e) => {
        if (e === null || typeof e !== "object") return e;
        const entry = e as Record<string, unknown>;
        return {
          ...entry,
          jobTitle: truncateStr(entry.jobTitle, RESUME_LIMITS.TEXT_FIELD_MAX),
          company: truncateStr(entry.company, RESUME_LIMITS.TEXT_FIELD_MAX),
          startDate: truncateStr(entry.startDate, RESUME_LIMITS.TEXT_FIELD_MAX),
          endDate: truncateStr(entry.endDate, RESUME_LIMITS.TEXT_FIELD_MAX),
          location: truncateStr(entry.location, RESUME_LIMITS.TEXT_FIELD_MAX),
          description: truncateStr(
            entry.description,
            RESUME_LIMITS.EXPERIENCE_DESCRIPTION_MAX
          ),
        };
      })
    : o.experience;

  const education = Array.isArray(o.education)
    ? o.education.slice(0, RESUME_LIMITS.EDUCATION_MAX).map((e) => {
        if (e === null || typeof e !== "object") return e;
        const entry = e as Record<string, unknown>;
        return {
          ...entry,
          institution: truncateStr(
            entry.institution,
            RESUME_LIMITS.TEXT_FIELD_MAX
          ),
          course: truncateStr(entry.course, RESUME_LIMITS.TEXT_FIELD_MAX),
          level: truncateStr(entry.level, RESUME_LIMITS.TEXT_FIELD_MAX),
          startDate: truncateStr(entry.startDate, RESUME_LIMITS.TEXT_FIELD_MAX),
          completionDate: truncateStr(
            entry.completionDate,
            RESUME_LIMITS.TEXT_FIELD_MAX
          ),
          description: entry.description
            ? truncateStr(
                entry.description,
                RESUME_LIMITS.EDUCATION_DESCRIPTION_MAX
              )
            : entry.description,
        };
      })
    : o.education;

  const hardSkills = Array.isArray(o.hardSkills)
    ? o.hardSkills
        .slice(0, RESUME_LIMITS.SKILLS_MAX)
        .map((s) => truncateStr(s, RESUME_LIMITS.TEXT_FIELD_MAX))
    : o.hardSkills;

  const softSkills = Array.isArray(o.softSkills)
    ? o.softSkills
        .slice(0, RESUME_LIMITS.SKILLS_MAX)
        .map((s) => truncateStr(s, RESUME_LIMITS.TEXT_FIELD_MAX))
    : o.softSkills;

  const languages = Array.isArray(o.languages)
    ? o.languages
        .slice(0, RESUME_LIMITS.LANGUAGES_MAX)
        .map((s) => truncateStr(s, RESUME_LIMITS.TEXT_FIELD_MAX))
    : o.languages;

  return {
    ...o,
    fullName: truncateStr(o.fullName, RESUME_LIMITS.TEXT_FIELD_MAX),
    email: truncateStr(o.email, RESUME_LIMITS.TEXT_FIELD_MAX),
    location: truncateStr(o.location, RESUME_LIMITS.TEXT_FIELD_MAX),
    phone: truncateStr(o.phone, RESUME_LIMITS.TEXT_FIELD_MAX),
    linkedin: truncateStr(o.linkedin, RESUME_LIMITS.TEXT_FIELD_MAX),
    github: truncateStr(o.github, RESUME_LIMITS.TEXT_FIELD_MAX),
    summary: truncateStr(o.summary, RESUME_LIMITS.SUMMARY_MAX),
    hardSkills,
    softSkills,
    languages,
    experience,
    education,
  };
}

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
  const hardSkills = data.hardSkills ?? [];
  const softSkills = data.softSkills ?? [];
  return [...hardSkills, ...softSkills];
}

export function getSkillsByCategoryForDisplay(
  data: ResumeData
): SkillCategory[] {
  const categories: SkillCategory[] = [];

  if (data.hardSkills && data.hardSkills.length > 0) {
    categories.push({
      category: "Habilidades Técnicas",
      items: data.hardSkills,
    });
  }

  if (data.softSkills && data.softSkills.length > 0) {
    categories.push({
      category: "Competências Comportamentais",
      items: data.softSkills,
    });
  }

  return categories;
}

export function formatLinkLabel(url: string): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "";
  return trimmed.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ensureAbsoluteUrl(url: string): string {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function formatPhoneBr(value: string): string {
  let digits = (value ?? "").replace(/\D/g, "");
  digits = digits.slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";

  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export const normalizeBrazilianPhone = (
  raw: string | null | undefined
): string => {
  if (!raw) return "";

  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("0055")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("055")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  if (digits.length > 11 && digits.startsWith("0")) {
    const possibleOperator = digits.slice(0, 3);
    const operatorCode = Number(possibleOperator.slice(1));
    if (operatorCode >= 10 && operatorCode <= 99) {
      digits = digits.slice(3);
    }
  }

  if (digits.length === 12 && digits.startsWith("0")) {
    const ddd = digits.slice(1, 4);
    const rest = digits.slice(4);
    const dddNumber = Number(ddd);
    if (dddNumber >= 11 && dddNumber <= 99 && rest.length >= 8) {
      digits = digits.slice(1);
    }
  }

  if (digits.length > 11) {
    const last11 = digits.slice(-11);
    if (last11.length === 11) {
      digits = last11;
    }
  }

  if (digits.length === 10 || digits.length === 11) {
    return digits;
  }

  return "";
};

export function getContactLine1ForDisplay(data: ResumeData): string {
  const parts: string[] = [];
  if (data.location) parts.push(data.location);
  const phoneDisplay = formatPhoneBr(data.phone ?? "");
  if (phoneDisplay) parts.push(phoneDisplay);
  return parts.join(" | ");
}

export function getContactLine2ForDisplay(data: ResumeData): string {
  const parts: string[] = [];
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
