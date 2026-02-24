import { type Schema, SchemaType } from "@google/generative-ai";

import { resumeExtractionResponseSchema } from "./resume-extraction-schema";

export const refinementResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    modifiedResume: resumeExtractionResponseSchema,
    summary: { type: SchemaType.STRING },
  },
  required: ["modifiedResume", "summary"],
} as Schema;
