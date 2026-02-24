import { Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AuthAwareLink } from "./auth-aware-link";

export function HeroSection() {
  return (
    <section className="flex w-full flex-col items-center gap-12 bg-background pt-20 pb-16">
      {/* Badge — subtle entrance */}
      <div
        className="animate-fade-up flex items-center gap-2 rounded-full bg-accent-brand-light px-4 py-2"
        style={{ animationDelay: "0ms" }}
      >
        <Sparkles className="size-3.5 text-accent-brand" />
        <span className="text-small-semibold text-accent-brand">
          Plataforma #1 para candidatos no Brasil
        </span>
      </div>

      {/* Headline + Subheadline — staggered fade-up */}
      <div className="flex flex-col items-center gap-5">
        <h1
          className="animate-fade-up max-w-hero-title text-center text-hero-large"
          style={{ animationDelay: "80ms" }}
        >
          Chega de <span className="text-accent-brand">perder tempo</span> com
          candidaturas
        </h1>
        <p
          className="animate-fade-up max-w-hero-desc text-center text-lg leading-relaxed text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          O MatchVaga adapta seu currículo automaticamente para cada vaga,
          otimiza para ATS e gera mensagens de apresentação —{" "}
          <span className="font-semibold text-accent-brand">
            tudo em segundos
          </span>
          .
        </p>
      </div>

      {/* CTAs */}
      <div
        className="animate-fade-up flex items-center gap-4"
        style={{ animationDelay: "240ms" }}
      >
        <Button variant="brand" className="gap-2" size="brand" asChild>
          <AuthAwareLink
            loggedOutLabel="Começar Grátis"
            loggedInLabel="Acessar Dashboard"
            icon={<Zap className="size-4" />}
          />
        </Button>
      </div>

      {/* Product Screenshot Placeholder */}
      <div
        className="animate-fade-up w-full max-w-landing-content"
        style={{ animationDelay: "320ms" }}
      >
        <div className="flex min-h-screenshot-hero w-full items-center justify-center rounded-xl border border-border bg-card">
          <span className="text-base font-medium text-muted-foreground">
            Screenshot placeholder
          </span>
        </div>
      </div>
    </section>
  );
}
