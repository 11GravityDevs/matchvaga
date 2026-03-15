export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type DbAnalysisStatus =
  | "pending"
  | "pending_payment"
  | "completed"
  | "abandoned";

export interface DbAnalysisRow {
  id: string;
  user_id: string;
  resume_id: string;
  job_snapshot: Json;
  score: number;
  optimized_score: number | null;
  matched_skills_count: number;
  user_hard_skills: Json;
  user_soft_skills: Json;
  missing_hard_skills: Json;
  missing_soft_skills: Json;
  status: DbAnalysisStatus | null;
  optimized_resume_data: Json | null;
  created_at: string;
}
