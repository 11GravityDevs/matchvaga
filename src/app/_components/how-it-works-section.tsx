import { AnimateOnScroll } from "./animate-on-scroll";

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "1",
    title: "Suba seu currículo",
    description:
      "Faça upload do seu currículo ou perfil LinkedIn. Nossa IA analisa suas competências, experiências e formação.",
  },
  {
    number: "2",
    title: "Cole a vaga desejada",
    description:
      "Cole o link ou descrição da vaga. A IA identifica palavras-chave, requisitos e competências que o ATS procura.",
  },
  {
    number: "3",
    title: "Receba tudo pronto",
    description:
      "Em segundos, receba currículo adaptado, carta de apresentação e mensagem de abordagem — tudo otimizado para ATS.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="flex w-full flex-col items-center gap-10 bg-surface-subtle py-12 md:scroll-mt-12 md:gap-14 md:py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4 px-4 md:px-0">
          <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            COMO FUNCIONA
          </span>
          <h2 className="text-center text-section-header-large">
            Três passos para a vaga dos seus sonhos
          </h2>
          <p className="max-w-section-desc text-center text-base leading-normal text-muted-foreground">
            De upload do currículo até candidatura otimizada em menos de 2
            minutos.
          </p>
        </div>
      </AnimateOnScroll>

      {/* Steps */}
      <div className="flex w-full flex-col gap-4 md:flex-row md:gap-8">
        {STEPS.map((step, i) => (
          <AnimateOnScroll key={step.number} delay={i * 80}>
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl border border-border bg-card p-5 md:p-8">
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent-brand-light">
                <span className="text-lg font-bold text-accent-brand">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
