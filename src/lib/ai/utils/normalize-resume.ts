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

  if (!Array.isArray(obj.skills)) obj.skills = [];
  if (!Array.isArray(obj.experience)) obj.experience = [];
  if (!Array.isArray(obj.education)) obj.education = [];

  if (Array.isArray(obj.skillsByCategory) && obj.skillsByCategory.length > 0) {
    obj.skillsByCategory = obj.skillsByCategory.map((cat: unknown) => {
      if (typeof cat !== "object" || cat === null || Array.isArray(cat))
        return { category: "Habilidades", items: [] };
      const c = cat as Record<string, unknown>;
      return {
        category: typeof c.category === "string" ? c.category : "Habilidades",
        items: Array.isArray(c.items)
          ? c.items.filter((x): x is string => typeof x === "string")
          : [],
      };
    });

    if (
      (obj.skills as string[]).length === 0 &&
      Array.isArray(obj.skillsByCategory)
    ) {
      obj.skills = (obj.skillsByCategory as { items: string[] }[]).flatMap(
        (c) => c.items
      );
    }
  }

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
    return e;
  });

  return obj;
}
