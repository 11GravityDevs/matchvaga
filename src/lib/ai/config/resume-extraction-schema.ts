import { SchemaType } from "@google/generative-ai";

const stringSchema = { type: SchemaType.STRING };

const experienceEntrySchema = {
  type: SchemaType.OBJECT,
  properties: {
    jobTitle: stringSchema,
    company: stringSchema,
    startDate: stringSchema,
    endDate: stringSchema,
    location: stringSchema,
    description: stringSchema,
    isCurrent: { type: SchemaType.BOOLEAN },
  },
  required: [
    "jobTitle",
    "company",
    "startDate",
    "endDate",
    "location",
    "description",
  ],
};

const educationEntrySchema = {
  type: SchemaType.OBJECT,
  properties: {
    institution: stringSchema,
    course: stringSchema,
    level: stringSchema,
    startDate: stringSchema,
    completionDate: stringSchema,
    description: stringSchema,
    isCurrent: { type: SchemaType.BOOLEAN },
  },
  required: ["institution", "course", "level", "startDate", "completionDate"],
};

export const resumeExtractionResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    fullName: stringSchema,
    email: stringSchema,
    location: stringSchema,
    phone: stringSchema,
    linkedin: stringSchema,
    github: stringSchema,
    summary: stringSchema,
    skills: { type: SchemaType.ARRAY, items: stringSchema },
    experience: { type: SchemaType.ARRAY, items: experienceEntrySchema },
    education: { type: SchemaType.ARRAY, items: educationEntrySchema },
  },
  required: [
    "fullName",
    "email",
    "location",
    "phone",
    "linkedin",
    "github",
    "summary",
    "skills",
    "experience",
    "education",
  ],
};
