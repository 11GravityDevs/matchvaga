"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  StepIndicator,
  type StepIndicatorStep,
} from "@/components/shared/step-indicator";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { getStepIndexFromPathname } from "@/utils/route";

import { OnboardingTopBar } from "./onboarding-top-bar";

const ONBOARDING_STEPS: StepIndicatorStep[] = [
  { id: "upload", label: "Upload" },
  { id: "verify", label: "Verificar" },
];

const STEP_PATHS = ["/onboarding/upload", "/onboarding/verify"] as const;

export function OnboardingLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSkip = useCallback(() => {
    router.push("/onboarding/upload");
  }, [router]);

  if (pathname.startsWith("/onboarding/preview")) {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <OnboardingTopBar showSkipButton onSkip={handleSkip} />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-(--surface-subtle) px-12 py-12">
          {children}
        </div>
      </main>
    );
  }

  const currentStepIndex = getStepIndexFromPathname(pathname, STEP_PATHS);

  return (
    <OnboardingProvider>
      <main className="flex min-h-screen flex-col bg-background">
        <OnboardingTopBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-7 bg-(--surface-subtle) py-12">
          <StepIndicator
            steps={ONBOARDING_STEPS}
            currentStepIndex={currentStepIndex}
          />
          {children}
        </div>
      </main>
    </OnboardingProvider>
  );
}
