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
    title: "Saiba exatamente o que falta no seu perfil",
    description:
      "Comparamos seu currículo com a vaga e mostramos gaps de competências, experiência e formação — com alguns cliques você já pode adicioná-los ao seu currículo.",
    reversed: true,
  },
  {
    tagIcon: <FileText className="size-3.5 text-accent-success" />,
    tagBg: "bg-accent-success-light",
    tagColor: "text-accent-success",
    tagText: "Currículo Inteligente",

    title: "Seu currículo adaptado automaticamente para cada vaga",
    description:
      "Nossa IA reorganiza, reescreve e otimiza seu currículo com as palavras-chave certas para cada vaga. Aumentando suas chances de passar pelo ATS e impressionar recrutadores.",
  },
  {
    tagIcon: <LayoutDashboard className="size-3.5 text-accent-warning" />,
    tagText: "Visão em Dashboard",
    tagBg: "bg-accent-warning-light",
    tagColor: "text-accent-warning",
    title: "Acompanhe todas suas análises em um só lugar",
    description:
      "Visualize todas suas análises, média de score e seus currículos anteriores em um dashboard claro e acionável, com dados que vão fazer total diferença na sua jornada.",
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
      id="recursos"
      className="flex w-full flex-col items-center gap-10 bg-background py-12 md:scroll-mt-12 md:gap-16 md:py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4 px-4 md:px-0">
          <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            RECURSOS
          </span>
          <h2 className="text-center text-section-header-large">
            Tudo que você precisa para se destacar
          </h2>
          <p className="max-w-section-desc text-center text-base leading-normal text-muted-foreground">
            Ferramentas inteligentes que transformam sua busca por emprego em um
            processo eficiente e estratégico.
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
