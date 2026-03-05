import { Suspense } from "react";
import { cookies } from "next/headers";

import { VerifyContent } from "./_components/verify-content";
import { Loading } from "@/components/ui/loading";
import {
  RESUME_STATUS_COOKIE_NAME,
  isResumeStatus,
} from "@/utils/resume-status-cookie";

export default async function OnboardingVerifyPage() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(RESUME_STATUS_COOKIE_NAME)?.value;
  const prefillValidationErrors =
    isResumeStatus(cookieValue) && cookieValue === "incomplete";

  return (
    <Suspense fallback={<Loading />}>
      <VerifyContent prefillValidationErrors={prefillValidationErrors} />
    </Suspense>
  );
}
