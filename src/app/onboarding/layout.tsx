import type { Metadata } from "next";

import { OnboardingLayoutClient } from "./_components/onboarding-layout-client";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Complete seu cadastro e envie seu currículo para começar.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OnboardingLayoutClient>{children}</OnboardingLayoutClient>;
}
