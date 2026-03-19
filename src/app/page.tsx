"use cache";

import type { Metadata } from "next";

import { SITE_URL } from "@/constants/site";
import { CoreFeaturesSection } from "./_components/core-features-section";
import { FAQSection } from "./_components/faq-section";
import { FinalCTASection } from "./_components/final-cta-section";
import { HeroSection } from "./_components/hero-section";
import { LandingPageTracker } from "./_components/landing-page-tracker";
import { LandingStructuredData } from "./_components/landing-structured-data";
import { LandingFooter } from "./_components/landing-footer";
import { LandingHeader } from "./_components/landing-header";
import { PricingSection } from "./_components/pricing-section";
import { ResourcesSection } from "./_components/resources-section";
import { SocialProofSection } from "./_components/social-proof-section";
import { AtsProblemSection } from "./_components/ats-problem-section";
import { AtsSolutionSection } from "./_components/ats-solution-section";

export const metadata: Metadata = {
  title: "MatchVaga",
  description:
    "Descubra por que seu currículo é rejeitado, veja os gaps em relação à vaga e gere uma versão otimizada para aumentar suas chances de passar pelos filtros ATS e conquistar mais entrevistas.",
  keywords: [
    "currículo",
    "currículo ATS",
    "otimização de currículo",
    "otimização ATS",
    "análise de currículo",
    "análise de currículo para vaga",
    "currículo para vaga de emprego",
    "currículo aprovado no ATS",
    "como passar no ATS",
    "palavras-chave no currículo",
    "compatibilidade currículo e vaga",
    "gaps de habilidades",
    "habilidades faltantes para vaga",
    "matching currículo vaga",
    "gerador de currículo",
    "currículo profissional",
    "melhorar currículo",
    "entrevista de emprego",
    "vaga de emprego",
    "candidatura",
    "emprego no Brasil",
    "mercado de trabalho brasileiro",
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
          <AtsProblemSection />
          <AtsSolutionSection />
          <CoreFeaturesSection />
          <ResourcesSection />
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
