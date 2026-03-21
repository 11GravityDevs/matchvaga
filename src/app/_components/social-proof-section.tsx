import { Star } from "lucide-react";

import { AnimateOnScroll } from "./animate-on-scroll";
import { BrandName } from "@/components/shared/brand-name";

interface Testimonial {
  quote: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "\u201cEm 2 semanas usando o MatchVaga, consegui 4 entrevistas. Antes, passava horas adaptando meu currículo manualmente e quase nunca recebia retorno.\u201d",
    name: "Marina Costa",
    initials: "MC",
    role: "Analista de Marketing, São Paulo",
    avatarColor: "bg-accent-brand",
  },
  {
    quote:
      "\u201cA análise de gap mudou minha vida. Descobri que faltava uma certificação específica no meu currículo — consegui a vaga depois de adicioná-la.\u201d",
    name: "Rafael Santos",
    initials: "RS",
    role: "Desenvolvedor Full Stack, Belo Horizonte",
    avatarColor: "bg-accent-success",
  },
  {
    quote:
      "\u201cAs mensagens de abordagem são incríveis. Recebi respostas de recrutadores em menos de 24 horas. Parece que foi escrito sob medida.\u201d",
    name: "Juliana Oliveira",
    initials: "JO",
    role: "Product Designer, Rio de Janeiro",
    avatarColor: "bg-accent-warning",
  },
];

function Stars() {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-4.5 fill-star-rating text-star-rating"
          aria-hidden
        />
      ))}
    </div>
  );
}

export function SocialProofSection() {
  return (
    <section
      id="depoimentos"
      className="flex w-full flex-col items-center gap-10 bg-background py-12 md:scroll-mt-12 md:gap-14 md:py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4 px-4 md:px-0">
          <span className="rounded-full border border-accent-brand px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            DEPOIMENTOS
          </span>
          <h2 className="text-center text-section-header-large">
            Veja como o <BrandName /> ajuda candidatos a aplicar melhor
          </h2>
          <p className="max-w-section-desc text-center text-base leading-normal text-muted-foreground">
            Histórias de candidatos que reduziram o tempo gasto com currículo e
            ganharam mais clareza para buscar entrevistas com estratégia.
          </p>
        </div>
      </AnimateOnScroll>

      {/* Testimonials */}
      <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <li key={t.name}>
            <AnimateOnScroll delay={i * 80} className="h-full">
              <figure className="flex h-full flex-col gap-5 rounded-xl border border-border bg-card p-5 md:p-7">
                <Stars />
                <blockquote className="text-body-15 text-foreground">
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full ${t.avatarColor}`}
                  >
                    <span className="text-sm font-semibold text-primary-foreground">
                      {t.initials}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {t.name}
                    </span>
                    <span className="text-small text-muted-foreground">
                      {t.role}
                    </span>
                  </div>
                </figcaption>
              </figure>
            </AnimateOnScroll>
          </li>
        ))}
      </ul>
    </section>
  );
}
