"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  StepIndicator,
  type StepIndicatorStep,
} from "@/components/shared/step-indicator";
import { ROUTE_ONBOARDING_UPLOAD } from "@/constants/routes";
import { OnboardingProvider } from "../_contexts/onboarding-context";
import { getStepIndexFromPathname } from "../_utils/route";

import { OnboardingTopBar } from "./onboarding-top-bar";

const ONBOARDING_STEPS: StepIndicatorStep[] = [
  { id: "upload", label: "Upload" },
  { id: "verify", label: "Verificar" },
];

const STEP_PATHS = [
  "/onboarding/enviar-curriculo",
  "/onboarding/verificar-informacoes",
] as const;

export function OnboardingLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSkip() {
    router.push(ROUTE_ONBOARDING_UPLOAD);
  }

  if (pathname.startsWith("/onboarding/como-funciona")) {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <OnboardingTopBar showSkipButton onSkip={handleSkip} />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-surface-subtle px-12 py-12">
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
        <div className="flex flex-1 flex-col items-center justify-center gap-7 bg-surface-subtle py-12">
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
