"use cache";

import type { Metadata } from "next";

import { SITE_URL } from "@/constants/site";
import { CoreFeaturesSection } from "./_components/core-features-section";
import { FAQSection } from "./_components/faq-section";
import { FinalCTASection } from "./_components/final-cta-section";
import { HeroSection } from "./_components/hero-section";
import { LandingPageTracker } from "./_components/landing-page-tracker";
import { LandingStructuredData } from "./_components/landing-structured-data";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { LandingFooter } from "./_components/landing-footer";
import { LandingHeader } from "./_components/landing-header";
import { PricingSection } from "./_components/pricing-section";
import { SecondaryFeaturesSection } from "./_components/secondary-features-section";
import { SocialProofSection } from "./_components/social-proof-section";

export const metadata: Metadata = {
  title: "MatchVaga - Chega de perder tempo com candidaturas",
  description:
    "MatchVaga é uma plataforma que adapta seu currículo automaticamente para cada vaga, otimiza para passar em sistemas ATS e gera mensagens de apresentação — tudo em segundos. Plataforma #1 para candidatos no Brasil.",
  keywords: [
    "currículo",
    "otimização ATS",
    "vaga de emprego",
    "candidatura",
    "Brasil",
  ],
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingPageTracker />
      <LandingStructuredData />
      <LandingHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-landing-content px-4 sm:px-8 xl:px-0">
          <HeroSection />
          <HowItWorksSection />
          <CoreFeaturesSection />
          <SecondaryFeaturesSection />
          <SocialProofSection />
          <PricingSection />
          <FAQSection />
        </div>
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
