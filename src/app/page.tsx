import type { Metadata } from "next";

import { CoreFeaturesSection } from "./_components/core-features-section";
import { FAQSection } from "./_components/faq-section";
import { FinalCTASection } from "./_components/final-cta-section";
import { HeroSection } from "./_components/hero-section";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { LandingFooter } from "./_components/landing-footer";
import { LandingHeader } from "./_components/landing-header";
import { PricingSection } from "./_components/pricing-section";
import { SecondaryFeaturesSection } from "./_components/secondary-features-section";
import { SocialProofSection } from "./_components/social-proof-section";

export const metadata: Metadata = {
  title: "MatchVaga - Chega de perder tempo com candidaturas",
  description:
    "O MatchVaga adapta seu currículo automaticamente para cada vaga, otimiza para ATS e gera mensagens de apresentação — tudo em segundos.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <div className="mx-auto w-full max-w-landing-content pt-20">
        <HeroSection />
        <HowItWorksSection />
        <CoreFeaturesSection />
        <SecondaryFeaturesSection />
        <SocialProofSection />
        <PricingSection />
        <FAQSection />
      </div>
      <FinalCTASection />
      <LandingFooter />
    </main>
  );
}
