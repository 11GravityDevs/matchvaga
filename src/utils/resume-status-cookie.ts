import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { getResumeValidationErrors } from "@/utils/resume-validation";

export const RESUME_STATUS_COOKIE_NAME = "mv_resume_status";

export type ResumeStatus = "none" | "incomplete" | "complete";

const VALID_RESUME_STATUSES: ResumeStatus[] = [
  "none",
  "incomplete",
  "complete",
];

export function isResumeStatus(
  value: string | undefined
): value is ResumeStatus {
  return (
    typeof value === "string" &&
    VALID_RESUME_STATUSES.includes(value as ResumeStatus)
  );
}

export function computeResumeStatusFromRow(
  row: { id: string; parsed_data: unknown } | null
): ResumeStatus {
  if (row == null || row.parsed_data == null) {
    return "none";
  }

  const parsed = resumeDataSchema.safeParse(row.parsed_data);

  if (!parsed.success) {
    return "incomplete";
  }

  const data = parsed.data as ResumeData;

  return getResumeValidationErrors(data) === null ? "complete" : "incomplete";
}

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export const RESUME_STATUS_COOKIE_OPTIONS = {
  path: "/",
  maxAge: THIRTY_DAYS_SECONDS,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
};
