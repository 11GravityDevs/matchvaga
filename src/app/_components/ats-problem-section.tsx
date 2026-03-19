import { FileText, ScanSearch, UserX } from "lucide-react";

import { AnimateOnScroll } from "./animate-on-scroll";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
}

const STEPS: Step[] = [
  {
    icon: <FileText className="size-5.5 text-accent-brand" />,
    title: "Você envia seu currículo",
    description:
      "Candidato envia o currículo com esperança e dedicação para a vaga dos sonhos, acredita que é sua chance.",
    iconBg: "bg-accent-brand-light",
  },
  {
    icon: <ScanSearch className="size-5.5 text-accent-warning" />,
    title: "O robô ATS analisa",
    description:
      "Um software frio e impessoal escaneia palavras-chave, formatação e estrutura em segundos.",
    iconBg: "bg-accent-warning-light",
  },
  {
    icon: <UserX className="size-5.5 text-destructive" />,
    title: "Seu currículo é descartado",
    description:
      "Sem as palavras-chave certas, você é eliminado automaticamente. Nenhum humano jamais leu seu currículo.",
    iconBg: "bg-accent-low-light",
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <AnimateOnScroll delay={index * 100}>
      <div className="flex h-full flex-col items-center gap-6 rounded-xl border border-border bg-card p-6 md:p-8">
        <div
          className={`flex size-11 items-center justify-center rounded-lg ${step.iconBg}`}
        >
          {step.icon}
        </div>

        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-center text-lg font-bold text-foreground">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

export function AtsProblemSection() {
  return (
    <section
      id="problema"
      className="flex w-full flex-col items-center gap-10 bg-background py-12 md:scroll-mt-12 md:gap-16 md:py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-6 px-4 md:px-0">
          <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            O VILÃO
          </span>

          {/* Headline */}
          <h2 className="max-w-faq text-center text-2xl leading-tight font-bold tracking-tight md:text-section-header-large">
            Robôs estão rejeitando seu currículo antes de qualquer humano ler
          </h2>

          {/* Subtitle */}
          <p className="max-w-section-desc text-center text-base leading-normal text-muted-foreground">
            Mais de 75% dos currículos são eliminados automaticamente por robôs
            de triagem (ATS) — sem que nenhum recrutador sequer veja seu nome.
          </p>
        </div>
      </AnimateOnScroll>

      {/* Step Cards */}
      <ol className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <StepCard step={step} index={i} />
          </li>
        ))}
      </ol>
    </section>
  );
}
