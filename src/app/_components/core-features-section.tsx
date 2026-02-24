import { ChartBar, FileText, Mail } from "lucide-react";

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
    tagIcon: <FileText className="size-3.5 text-accent-brand" />,
    tagText: "Currículo Inteligente",
    tagBg: "bg-accent-brand-light",
    tagColor: "text-accent-brand",
    title: "Currículo adaptado automaticamente para cada vaga",
    description:
      "Nossa IA reorganiza, reescreve e otimiza seu currículo com as palavras-chave certas para cada vaga. Aumente suas chances de passar pelo ATS e impressionar recrutadores.",
  },
  {
    tagIcon: <ChartBar className="size-3.5 text-accent-success" />,
    tagText: "Análise de Gap",
    tagBg: "bg-accent-success-light",
    tagColor: "text-accent-success",
    title: "Saiba exatamente o que falta no seu perfil",
    description:
      "Comparamos seu currículo com a vaga e mostramos gaps de competências, experiência e formação — com sugestões práticas de como preenchê-los.",
    reversed: true,
  },
  {
    tagIcon: <Mail className="size-3.5 text-accent-warning" />,
    tagText: "Mensagens de Abordagem",
    tagBg: "bg-accent-warning-light",
    tagColor: "text-accent-warning",
    title: "Mensagens que abrem portas e geram respostas",
    description:
      "Gere mensagens personalizadas para recrutadores no LinkedIn, e-mails de apresentação e follow-ups que demonstram seu valor único para a posição.",
  },
];

function ScreenshotPlaceholder() {
  return (
    <div className="flex min-h-80 flex-1 items-center justify-center rounded-xl border border-border bg-surface-subtle">
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
      className="flex w-full flex-col items-center gap-16 bg-background py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4">
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
            <div className="flex w-full items-center gap-12">
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
