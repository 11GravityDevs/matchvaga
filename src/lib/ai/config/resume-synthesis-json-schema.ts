export const RESUME_SYNTHESIS_SUMMARY_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: { type: "string" as const },
  },
  required: ["summary"] as const,
  additionalProperties: false,
};

const hardSkillsByCategoryItem = {
  type: "object" as const,
  properties: {
    category: { type: "string" as const },
    items: {
      type: "array" as const,
      items: { type: "string" as const },
    },
  },
  required: ["category", "items"] as const,
  additionalProperties: false,
} as const;

export const RESUME_SYNTHESIS_HARD_SKILLS_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    hardSkillsByCategory: {
      type: "array" as const,
      items: hardSkillsByCategoryItem,
    },
  },
  required: ["hardSkillsByCategory"] as const,
  additionalProperties: false,
};

export const RESUME_SYNTHESIS_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: { type: "string" as const },
    hardSkillsByCategory: {
      type: "array" as const,
      items: hardSkillsByCategoryItem,
    },
  },
  required: ["summary", "hardSkillsByCategory"] as const,
  additionalProperties: false,
};
