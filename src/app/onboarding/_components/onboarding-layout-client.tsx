"use client";

import { usePathname } from "next/navigation";

import { OnboardingProvider } from "@/contexts/onboarding-context";
import {
  StepIndicator,
  type StepIndicatorStep,
} from "@/components/shared/step-indicator";

export function getStepIndexFromPathname(
  pathname: string,
  stepPaths: readonly string[]
): number {
  const index = stepPaths.findIndex((path) => pathname.startsWith(path));
  return index >= 0 ? index : 0;
}

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
  const currentStepIndex = getStepIndexFromPathname(pathname, STEP_PATHS);

  return (
    <OnboardingProvider>
      <main className="flex min-h-screen flex-col bg-background">
        <OnboardingTopBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-7 bg-[#F8FAFC] px-12 py-8">
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
