import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

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

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <LandingHeader isLoggedIn={isLoggedIn} />
      <div className="mx-auto w-full max-w-landing-content">
        <HeroSection isLoggedIn={isLoggedIn} />
        <HowItWorksSection />
        <CoreFeaturesSection />
        <SecondaryFeaturesSection />
        <SocialProofSection />
        <PricingSection isLoggedIn={isLoggedIn} />
        <FAQSection />
      </div>
      <FinalCTASection isLoggedIn={isLoggedIn} />
      <LandingFooter />
    </main>
  );
}
