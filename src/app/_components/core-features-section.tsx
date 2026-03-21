import { ChartBar, FileText, LayoutDashboard } from "lucide-react";

import { cn } from "@/utils/style";

import { AnimateOnScroll } from "./animate-on-scroll";

interface Feature {
  tagIcon: React.ReactNode;
  tagText: string;
  tagBg: string;
  tagColor: string;
  title: string;
  description: string;
  reversed?: boolean;
}

const FEATURES: Feature[] = [
  {
    tagIcon: <ChartBar className="size-3.5 text-accent-brand" />,
    tagText: "Análise de Gap",
    tagBg: "bg-accent-brand-light",
    tagColor: "text-accent-brand",
    title: "Descubra por que seu currículo não está convencendo",
    description:
      "Veja com clareza quais competências, experiências e palavras-chave estão faltando para cada vaga e selecione as habilidades que fazem sentido antes de se candidatar.",
    reversed: true,
  },
  {
    tagIcon: <FileText className="size-3.5 text-accent-success" />,
    tagBg: "bg-accent-success-light",
    tagColor: "text-accent-success",
    tagText: "Currículo Inteligente",

    title: "Gere uma versão do seu currículo mais forte para cada vaga",
    description:
      "Nossa IA reorganiza e reescreve seu currículo com foco no que a vaga pede, para aumentar sua aderência na triagem e facilitar a leitura do recrutador.",
  },
  {
    tagIcon: <LayoutDashboard className="size-3.5 text-accent-warning-text" />,
    tagText: "Visão em Dashboard",
    tagBg: "bg-accent-warning-light",
    tagColor: "text-accent-warning-text",
    title: "Acompanhe suas candidaturas com mais estratégia",
    description:
      "Visualize análises anteriores, compare scores e reaproveite versões otimizadas para aplicar com mais velocidade e menos retrabalho.",
    reversed: true,
  },
];

function ScreenshotPlaceholder() {
  return (
    <div className="flex min-h-48 flex-1 items-center justify-center rounded-xl border border-border bg-surface-subtle md:min-h-80">
      <span className="text-sm font-medium text-muted-foreground">
        Screenshot placeholder
      </span>
    </div>
  );
}

export function CoreFeaturesSection() {
  return (
    <section
      id="funcionalidades"
      className="flex w-full flex-col items-center gap-10 bg-background py-12 md:scroll-mt-12 md:gap-16 md:py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4 px-4 md:px-0">
          <span className="rounded-full border border-accent-brand px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            FUNCIONALIDADES
          </span>
          <h2 className="text-center text-section-header-large">
            Tudo que você precisa para se destacar
          </h2>
          <p className="max-w-section-desc text-center text-base leading-normal text-muted-foreground">
            Cada etapa foi pensada para ajudar você a entender o que melhorar,
            adaptar seu currículo mais rápido e se candidatar com mais
            confiança.
          </p>
        </div>
      </AnimateOnScroll>

      {/* Feature Rows */}
      {FEATURES.map((feature, i) => {
        const textContent = (
          <div className="flex flex-1 flex-col gap-5">
            <div
              className={`flex w-fit items-center gap-1.5 rounded-md ${feature.tagBg} px-2.5 py-1`}
            >
              {feature.tagIcon}
              <span className={`text-xs font-semibold ${feature.tagColor}`}>
                {feature.tagText}
              </span>
            </div>
            <h3 className="text-page-title leading-snug">{feature.title}</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        );

        return (
          <AnimateOnScroll key={feature.tagText} delay={i * 100}>
            <div
              className={cn(
                "flex w-full flex-col items-center gap-6 md:flex-row md:gap-12",
                feature.reversed && "max-md:flex-col-reverse"
              )}
            >
              {feature.reversed ? (
                <>
                  <ScreenshotPlaceholder />
                  {textContent}
                </>
              ) : (
                <>
                  {textContent}
                  <ScreenshotPlaceholder />
                </>
              )}
            </div>
          </AnimateOnScroll>
        );
      })}
    </section>
  );
}
