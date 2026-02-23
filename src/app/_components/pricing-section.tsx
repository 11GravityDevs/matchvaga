import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTE_DASHBOARD, ROUTE_LOGIN } from "@/constants/routes";

interface PricingSectionProps {
  isLoggedIn?: boolean;
}

const FREE_FEATURES = [
  "3 análises por mês",
  "Currículo adaptado básico",
  "Score ATS",
  "1 mensagem de abordagem",
];

interface ProFeature {
  text: string;
  bold?: boolean;
}

const PRO_FEATURES: ProFeature[] = [
  { text: "Análises ilimitadas", bold: true },
  { text: "Currículo + carta de apresentação" },
  { text: "Mensagens de abordagem ilimitadas" },
  { text: "Análise de gap detalhada" },
  { text: "Exportação PDF e DOCX" },
  { text: "Suporte prioritário" },
];

export function PricingSection({ isLoggedIn = false }: PricingSectionProps) {
  return (
    <section
      id="precos"
      className="flex w-full flex-col items-center gap-12 bg-surface-subtle py-20"
    >
      <div className="mx-auto flex w-full max-w-landing-content flex-col items-center gap-12">
        {/* Section Header */}
        <div className="flex max-w-section-header flex-col items-center gap-4">
          <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            PREÇOS
          </span>
          <h2 className="text-center text-section-header-large">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-center text-base leading-normal text-muted-foreground">
            Comece grátis. Faça upgrade quando estiver pronto.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex w-full gap-6">
          {/* Free Plan */}
          <div className="flex flex-1 flex-col gap-6 self-start rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">Grátis</h3>
              <p className="text-sm text-muted-foreground">
                Para começar a explorar
              </p>
            </div>

            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-foreground">
                R$ 0
              </span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </div>

            <div className="h-px w-full bg-border" />

            <div className="flex flex-col gap-3.5">
              {FREE_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <Check className="size-4 text-accent-success" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full py-3.5" asChild>
              <Link href={isLoggedIn ? ROUTE_DASHBOARD : ROUTE_LOGIN}>
                {isLoggedIn ? "Acessar Dashboard" : "Começar Grátis"}
              </Link>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="flex flex-1 flex-col gap-6 rounded-xl border-2 border-accent-brand bg-card p-8">
            <span className="w-fit rounded-full bg-accent-brand px-3 py-1 text-badge tracking-wide text-on-accent-brand">
              MAIS POPULAR
            </span>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Profissional
              </h3>
              <p className="text-sm text-muted-foreground">
                Para quem leva a busca a sério
              </p>
            </div>

            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-foreground">
                R$ 19,90
              </span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </div>

            <div className="h-px w-full bg-border" />

            <div className="flex flex-col gap-3.5">
              {PRO_FEATURES.map((feature) => (
                <div key={feature.text} className="flex items-center gap-2.5">
                  <Check className="size-4 text-accent-success" />
                  <span
                    className={`text-sm text-foreground ${feature.bold ? "font-semibold" : ""}`}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Button variant="brand" className="w-full py-3.5" asChild>
              <Link href={isLoggedIn ? ROUTE_DASHBOARD : ROUTE_LOGIN}>
                {isLoggedIn ? "Ir ao Dashboard" : "Começar Agora"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
