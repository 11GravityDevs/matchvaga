import { OnboardingLayoutClient } from "./_components/onboarding-layout-client";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OnboardingLayoutClient>{children}</OnboardingLayoutClient>;
}
