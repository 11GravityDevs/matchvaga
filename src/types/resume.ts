export interface ExperienceEntry {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  isCurrent?: boolean;
}

export interface EducationEntry {
  institution: string;
  course: string;
  level: string;
  startDate: string;
  completionDate: string;
  description?: string;
  isCurrent?: boolean;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ResumeData {
  fullName: string;
  email: string;
  location: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: string[];
  skillsByCategory?: SkillCategory[];
  languages?: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
}

export const createEmptyExperience = (): ExperienceEntry => ({
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  location: "",
  description: "",
});

export const createEmptyEducation = (): EducationEntry => ({
  institution: "",
  course: "",
  level: "",
  startDate: "",
  completionDate: "",
});
