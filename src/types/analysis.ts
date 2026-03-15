import type { JobSnapshot } from "@/schemas/job";
import type { ResumeData } from "@/types/resume";
import type { MissingSkillsByCategory } from "@/utils/analysis";

export type AnalysisStatus =
  | "pending"
  | "pending_payment"
  | "completed"
  | "abandoned";

export interface AnalysisSummaryRow {
  id: string;
  resumeId: string;
  jobSnapshot: JobSnapshot;
  score: number;
  optimizedScore: number | null;
  matchedSkillsCount: number;
  createdAt: string;
  status: AnalysisStatus;
}

export interface AnalysisDetail {
  id: string;
  resumeId: string;
  jobSnapshot: JobSnapshot;
  score: number;
  optimizedScore: number | null;
  matchedSkillsCount: number;
  missingSkills: MissingSkillsByCategory;
  createdAt: string;
  status: AnalysisStatus;
  optimizedResumeData?: ResumeData | null;
}

export interface AnalysisHistoryTableRowViewModel {
  analysisId: string;
  role: string;
  company: string;
  companyInitials: string;
  companyBg: string;
  companyTextColor: string;
  date: string;
  before: string;
  beforeColor: string;
  after: string;
  afterColor: string;
  status: AnalysisStatus;
}
