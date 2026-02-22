import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasResume } from "@/app/actions/resume";
import { COOKIE_ONBOARDING_IN_PROGRESS } from "@/constants/onboarding";
import { ROUTE_DASHBOARD } from "@/constants/routes";
import { OnboardingLayoutClient } from "./_components/onboarding-layout-client";

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userHasResume = await hasResume();
  const cookieStore = await cookies();
  const onboardingInProgress = cookieStore.get(
    COOKIE_ONBOARDING_IN_PROGRESS
  )?.value;

  if (userHasResume && !onboardingInProgress) {
    redirect(ROUTE_DASHBOARD);
  }

  return <OnboardingLayoutClient>{children}</OnboardingLayoutClient>;
}
