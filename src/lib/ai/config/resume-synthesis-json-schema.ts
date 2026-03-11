export const RESUME_SYNTHESIS_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: { type: "string" as const },
    hardSkillsByCategory: {
      type: "array" as const,
      items: {
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
      },
    },
  },
  required: ["summary", "hardSkillsByCategory"] as const,
  additionalProperties: false,
};
