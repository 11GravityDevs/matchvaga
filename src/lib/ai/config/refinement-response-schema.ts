import { resumeExtractionResponseSchema } from "./resume-extraction-schema";

export const refinementResponseSchema = {
  type: "object",
  properties: {
    modifiedResume: resumeExtractionResponseSchema,
    summary: { type: "string" },
  },
  required: ["modifiedResume", "summary"],
} as const;
