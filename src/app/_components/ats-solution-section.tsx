import { ArrowRight, Check, CircleCheck, CircleX, X } from "lucide-react";

import { AnimateOnScroll } from "./animate-on-scroll";

interface ComparisonItem {
  text: string;
}

const BEFORE_ITEMS: ComparisonItem[] = [
  { text: "Palavras-chave genéricas que não combinam com a vaga" },
  { text: "Formato incompatível com leitores automáticos" },
  { text: "Experiências listadas sem relevância para o cargo" },
  { text: "Zero personalização por candidatura" },
];

const AFTER_ITEMS: ComparisonItem[] = [
  { text: "Palavras-chave extraídas diretamente da descrição da vaga" },
  { text: "Formatação limpa e compatível com todos os ATS" },
  { text: "Experiências reordenadas por relevância ao cargo" },
  { text: "Adaptação automática para cada candidatura" },
];

function BeforeCard() {
  return (
    <div className="flex flex-1 flex-col gap-6 rounded-xl border border-red-300 bg-card p-6 md:p-8">
      {/* Badge */}
      <div className="flex w-fit items-center gap-2 rounded-full bg-accent-low-light px-3 py-1.5">
        <CircleX className="size-3.5 text-destructive" />
        <span className="text-xs font-semibold text-destructive">
          Sem otimização
        </span>
      </div>

      <div className="space-y-4">
        <h3 className="text-[22px] font-bold text-foreground">
          Currículo genérico
        </h3>

        {/* List */}
        <ul className="flex flex-col gap-4">
          {BEFORE_ITEMS.map((item) => (
            <li key={item.text} className="flex items-start gap-3">
              <X className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Score */}
      <div className="mt-auto flex items-center justify-between rounded-lg border border-accent-low-border bg-accent-low-light px-5 py-4">
        <span className="text-sm font-medium text-accent-low-text">
          Score ATS estimado
        </span>
        <span className="text-2xl font-extrabold text-destructive">23%</span>
      </div>
    </div>
  );
}

function AfterCard() {
  return (
    <div className="flex flex-1 flex-col gap-6 rounded-xl border-2 border-accent-brand bg-card p-6 shadow-[0_12px_32px_-4px_rgba(37,99,235,0.1)] md:p-8">
      {/* Badge */}
      <div className="flex w-fit items-center gap-2 rounded-full bg-accent-brand-light px-3 py-1.5">
        <CircleCheck className="size-3.5 text-accent-brand" />
        <span className="text-xs font-semibold text-accent-brand">
          Com MatchVaga
        </span>
      </div>

      <div className="space-y-4">
        <h3 className="text-[22px] font-bold text-foreground">
          Currículo sob medida
        </h3>

        {/* List */}
        <ul className="flex flex-col gap-4">
          {AFTER_ITEMS.map((item) => (
            <li key={item.text} className="flex items-start gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-accent-success" />
              <span className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Score */}
      <div className="mt-auto flex items-center justify-between rounded-lg border border-accent-brand-border bg-accent-brand-light px-5 py-4">
        <span className="text-sm font-medium text-accent-brand-dark">
          Score ATS estimado
        </span>
        <span className="text-2xl font-extrabold text-accent-brand">88%</span>
      </div>
    </div>
  );
}

export function AtsSolutionSection() {
  return (
    <section
      id="solucao"
      className="flex w-full flex-col items-center gap-10 bg-background py-12 md:scroll-mt-12 md:gap-16 md:py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4 px-4 md:px-0">
          <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            A SOLUÇÃO
          </span>
          <h2 className="text-center text-2xl leading-tight font-bold tracking-tight md:text-section-header-large">
            Descubra o que está faltando e gere um currículo mais alinhado à
            vaga
          </h2>
          <p className="max-w-section-desc text-center text-base leading-normal text-muted-foreground">
            O MatchVaga compara seu currículo com a vaga, aponta os principais
            gaps e gera uma versão otimizada com mais aderência aos critérios
            usados na triagem.
          </p>
        </div>
      </AnimateOnScroll>

      {/* Comparison Cards */}
      <AnimateOnScroll className="w-full">
        <div className="flex w-full flex-col gap-12 md:flex-row md:justify-between">
          <BeforeCard />

          {/* Arrow Center */}
          <div className="flex shrink-0 items-center justify-center">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent-brand shadow-[0_8px_24px_rgba(37,99,235,0.25)] md:size-10">
              <ArrowRight className="size-5 rotate-90 text-white md:size-5 md:rotate-0" />
            </div>
          </div>

          <AfterCard />
        </div>
      </AnimateOnScroll>
    </section>
  );
}
