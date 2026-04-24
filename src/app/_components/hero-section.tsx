import { Sparkles } from "lucide-react";
import Image from "next/image";

import { HeroPrimaryCtaButton } from "./hero-primary-cta-button";

export function HeroSection() {
  return (
    <section className="flex w-full flex-col items-center gap-8 bg-background pt-12 pb-12 md:gap-12 md:pt-40 md:pb-16">
      {/* Badge — subtle entrance */}
      <div
        className="animate-fade-up flex items-center gap-2 rounded-full bg-accent-brand-light px-4 py-2"
        style={{ animationDelay: "0ms" }}
      >
        <Sparkles className="size-3.5 text-accent-brand-dark" />
        <span className="text-small-semibold text-accent-brand-dark">
          Seu currículo pronto em segundos
        </span>
      </div>

      {/* Headline + Subheadline — staggered fade-up */}
      <div className="flex flex-col items-center gap-5">
        <h1
          className="animate-fade-up max-w-hero-title text-center text-3xl font-extrabold md:text-hero-large"
          style={{ animationDelay: "80ms" }}
        >
          Adapte seu currículo para cada vaga e{" "}
          <span className="text-accent-brand">aumente suas chances</span> de
          entrevista
        </h1>
        <p
          className="animate-fade-up max-w-hero-desc text-center text-base leading-relaxed text-muted-foreground md:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          Envie seu currículo, cole a vaga e receba uma análise clara do que
          está faltando, um score de compatibilidade e uma versão otimizada para
          passar pelos filtros ATS —{" "}
          <span className="font-semibold text-accent-brand">
            sem reescrever tudo do zero
          </span>
          .
        </p>
      </div>

      {/* CTAs */}
      <div
        className="animate-fade-up flex items-center gap-4"
        style={{ animationDelay: "240ms" }}
      >
        <HeroPrimaryCtaButton />
      </div>

      <div
        className="animate-fade-up w-full max-w-landing-content"
        style={{ animationDelay: "320ms" }}
      >
        <Image
          src="/dashboard.png"
          alt="Visão geral do dashboard do MatchVaga"
          width={1920}
          height={911}
          priority
          unoptimized
          sizes="(min-width: 1140px) 1140px, 100vw"
          className="h-auto w-full rounded-md border border-border shadow-md shadow-accent-brand/10"
        />
      </div>
    </section>
  );
}
