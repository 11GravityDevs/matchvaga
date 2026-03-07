function normalizeMonthYear(value: unknown): string {
  if (value == null || typeof value !== "string") return "";

  const v = value.trim();

  if (/^\d{4}$/.test(v)) return `${v}-01`;

  return v;
}

export function normalizeAIResumeData(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw;

  const obj = { ...(raw as Record<string, unknown>) };

  for (const key of [
    "fullName",
    "email",
    "location",
    "phone",
    "linkedin",
    "github",
    "summary",
  ]) {
    if (obj[key] == null) obj[key] = "";
  }

  if (!Array.isArray(obj.hardSkills)) obj.hardSkills = [];

  if (!Array.isArray(obj.softSkills)) obj.softSkills = [];

  if (!Array.isArray(obj.languages)) obj.languages = [];

  if (!Array.isArray(obj.experience)) obj.experience = [];

  if (!Array.isArray(obj.education)) obj.education = [];

  obj.experience = (obj.experience as unknown[]).map((exp) => {
    if (typeof exp !== "object" || exp === null || Array.isArray(exp))
      return exp;
    const e = { ...(exp as Record<string, unknown>) };
    for (const key of [
      "jobTitle",
      "company",
      "startDate",
      "endDate",
      "location",
      "description",
    ]) {
      if (e[key] == null) e[key] = "";
    }

    e.startDate = normalizeMonthYear(e.startDate);
    e.endDate = normalizeMonthYear(e.endDate);

    return e;
  });

  obj.education = (obj.education as unknown[]).map((edu) => {
    if (typeof edu !== "object" || edu === null || Array.isArray(edu))
      return edu;
    const e = { ...(edu as Record<string, unknown>) };
    for (const key of [
      "institution",
      "course",
      "level",
      "startDate",
      "completionDate",
      "description",
    ]) {
      if (e[key] == null && key !== "description") e[key] = "";
    }

    e.startDate = normalizeMonthYear(e.startDate);
    e.completionDate = normalizeMonthYear(e.completionDate);

    return e;
  });

  return obj;
}
