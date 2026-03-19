const stringSchema = { type: "string" };

const experienceEntrySchema = {
  type: "object",
  properties: {
    jobTitle: stringSchema,
    company: stringSchema,
    startDate: stringSchema,
    endDate: stringSchema,
    location: stringSchema,
    description: stringSchema,
    isCurrent: { type: "boolean" },
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
  type: "object",
  properties: {
    institution: stringSchema,
    course: stringSchema,
    level: stringSchema,
    startDate: stringSchema,
    completionDate: stringSchema,
    description: stringSchema,
    isCurrent: { type: "boolean" },
  },
  required: ["institution", "course", "level", "startDate", "completionDate"],
};

export const resumeExtractionResponseSchema = {
  type: "object",
  properties: {
    fullName: stringSchema,
    email: stringSchema,
    location: stringSchema,
    phone: stringSchema,
    linkedin: stringSchema,
    github: stringSchema,
    summary: stringSchema,
    hardSkills: { type: "array", items: stringSchema },
    softSkills: { type: "array", items: stringSchema },
    languages: { type: "array", items: stringSchema },
    experience: { type: "array", items: experienceEntrySchema },
    education: { type: "array", items: educationEntrySchema },
  },
  required: [
    "fullName",
    "email",
    "location",
    "phone",
    "linkedin",
    "github",
    "summary",
    "hardSkills",
    "softSkills",
    "languages",
    "experience",
    "education",
  ],
};
