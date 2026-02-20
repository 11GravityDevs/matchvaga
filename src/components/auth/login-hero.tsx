import { BarChart3, MessageSquare, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function LoginHero() {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-1/2 flex-col overflow-hidden",
        "bg-linear-to-br from-blue-900 via-accent-brand to-blue-500"
      )}
    >
      <div
        className="absolute -top-16 -left-20 h-[300px] w-[300px] rounded-full border border-white/10 bg-blue-500/20"
        aria-hidden
      />
      <div
        className="absolute top-[600px] right-[100px] h-[200px] w-[200px] rounded-full border border-white/10 bg-blue-700/20"
        aria-hidden
      />
      <div
        className="absolute top-[200px] right-[50px] h-[120px] w-[120px] rounded-full bg-accent-success/15"
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

      <div className="relative z-10 flex flex-1 flex-col justify-center px-12 pr-[15%] pl-[10%]">
        <div
          className={cn(
            "absolute top-[22%] right-[12%] flex items-center gap-4 rounded-2xl bg-card px-5 py-4 shadow-xs",
            "-rotate-2"
          )}
        >
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[26px] bg-accent-success">
            <span className="text-lg font-bold text-white">92</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-foreground">
              Pontuação ATS
            </span>
            <span className="text-xs font-normal text-accent-success">
              Compatibilidade alta
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 text-left">
          <h1 className="max-w-[420px] text-[48px] leading-[1.1] font-bold tracking-[-0.5px] text-white">
            Seu currículo,
            <br />
            otimizado por IA.
          </h1>
          <p className="max-w-[340px] text-base leading-[1.6] font-normal text-white/80">
            Aumente suas chances com análise inteligente de vagas e adaptação
            automática do seu currículo.
          </p>
        </div>

        <div className="relative mt-20 flex flex-col gap-5">
          <div className="flex items-center gap-3 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-[13px] font-medium text-white/87">
              Currículo adaptado automaticamente
            </span>
          </div>
          <div className="flex items-center gap-3 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-[13px] font-medium text-white/87">
              Análise detalhada de requisitos
            </span>
          </div>
          <div className="flex items-center gap-3 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-[13px] font-medium text-white/87">
              Mensagens personalizadas para cada vaga
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
