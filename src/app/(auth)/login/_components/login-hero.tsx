import { BarChart3, MessageSquare, Sparkles } from "lucide-react";

import { cn } from "@/utils/style";

export function LoginHero() {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-1/2 flex-col overflow-hidden",
        "bg-linear-to-br from-accent-brand-dark via-accent-brand to-accent-brand-end"
      )}
    >
      <div
        className="absolute -top-16 -left-20 size-72 rounded-full border border-white/10 bg-accent-brand-end/20"
        aria-hidden
      />
      <div
        className="absolute size-48 rounded-full border border-white/10 bg-accent-brand-hover/20"
        style={{
          top: "var(--top-hero-circle-2)",
          right: "var(--right-hero-circle-2)",
        }}
        aria-hidden
      />
      <div
        className="absolute size-32 rounded-full bg-accent-success/15"
        style={{
          top: "var(--top-hero-circle-3)",
          right: "var(--right-hero-circle-3)",
        }}
        aria-hidden
      />

      <div
        className="absolute top-[500px] left-10 flex flex-col gap-6 opacity-15"
        aria-hidden
      >
        {Array.from({ length: 3 }).map((_, row) => (
          <div key={row} className="flex gap-6">
            {Array.from({ length: 5 }).map((_, col) => (
              <div key={col} className="h-1 w-1 rounded-full bg-white" />
            ))}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-6 px-12 pr-[15%] pl-[10%]">
        <div className="flex items-center gap-4 self-start rounded-2xl bg-card px-5 py-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-success">
            <span className="text-lg font-bold text-white">92</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-small-semibold text-foreground">
              Pontuação ATS
            </span>
            <span className="text-xs font-normal text-accent-success">
              Compatibilidade alta
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 text-left">
          <h1 className="max-w-login-hero-title text-hero text-white">
            Seu currículo otimizado para a sua vaga dos sonhos.
          </h1>
          <p className="max-w-hero-desc text-lg font-normal text-white/80">
            Aumente suas chances com a análise inteligente de vagas e adaptação
            automática do seu currículo.
          </p>
        </div>

        <div className="relative mt-20 flex flex-col gap-5">
          <div className="flex items-center gap-3 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-small-medium text-white/87">
              Currículo adaptado automaticamente
            </span>
          </div>
          <div className="flex items-center gap-3 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-small-medium text-white/87">
              Análise detalhada de requisitos
            </span>
          </div>
          <div className="flex items-center gap-3 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-small-medium text-white/87">
              Mensagens personalizadas para cada vaga
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
