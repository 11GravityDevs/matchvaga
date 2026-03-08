export const JOB_SKILLS_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    hard_skills: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          original_term: { type: "string" as const },
          type: {
            type: "string" as const,
            enum: ["required", "differential"] as const,
          },
        },
        required: ["name", "original_term", "type"] as const,
        additionalProperties: false,
      },
    },
    soft_skills: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          original_term: { type: "string" as const },
          type: {
            type: "string" as const,
            enum: ["required", "differential"] as const,
          },
        },
        required: ["name", "original_term", "type"] as const,
        additionalProperties: false,
      },
    },
    is_job_description: { type: "boolean" as const },
  },
  required: ["hard_skills", "soft_skills", "is_job_description"] as const,
  additionalProperties: false,
};
