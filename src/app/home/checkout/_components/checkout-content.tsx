"use client";

import { useState } from "react";

import { Check, Clock, CreditCard, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/style";

interface Package {
  id: string;
  name: string;
  count: number;
  price: number;
  pricePerAnalysis: number;
  savingsPercent: number;
  recommended?: boolean;
}

const BASE_PRICE_PER_ANALYSIS = 1.67;

const PACKAGES: Package[] = [
  {
    id: "entrada",
    name: "Entrada",
    count: 3,
    price: 5,
    pricePerAnalysis: 1.67,
    savingsPercent: 0,
  },
  {
    id: "basico",
    name: "Básico",
    count: 10,
    price: 14,
    pricePerAnalysis: 1.4,
    savingsPercent: Math.round(
      ((BASE_PRICE_PER_ANALYSIS - 1.4) / BASE_PRICE_PER_ANALYSIS) * 100
    ),
  },
  {
    id: "padrao",
    name: "Padrão",
    count: 25,
    price: 29,
    pricePerAnalysis: 1.16,
    savingsPercent: Math.round(
      ((BASE_PRICE_PER_ANALYSIS - 1.16) / BASE_PRICE_PER_ANALYSIS) * 100
    ),
    recommended: true,
  },
  {
    id: "job-hunter",
    name: "Profissional",
    count: 50,
    price: 49,
    pricePerAnalysis: 0.98,
    savingsPercent: Math.round(
      ((BASE_PRICE_PER_ANALYSIS - 0.98) / BASE_PRICE_PER_ANALYSIS) * 100
    ),
  },
];

const FEATURES: Record<string, string[]> = {
  entrada: ["Ideal para experimentar", "Sem validade"],
  basico: ["Bom para busca ativa", "Sem validade"],
  padrao: ["Melhor custo-benefício", "Sem validade", "Prioridade no suporte"],
  "job-hunter": [
    "Para quem aplica constantemente",
    "Sem validade",
    "Prioridade no suporte",
  ],
};

export function CheckoutContent() {
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);

  const handleSelectPackage = (id: string) => {
    setLoadingPackageId(id);

    setTimeout(() => {
      setLoadingPackageId(null);
    }, 2000);
  };

  return (
    <main className="flex flex-1 flex-col section-gap page-padding">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title">Comprar Análises</h1>
        <p className="text-page-subtitle">
          Escolha o pacote ideal para seu momento.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((pkg) => {
          const features = FEATURES[pkg.id];

          return (
            <Card
              key={pkg.id}
              className={cn(
                "relative flex flex-col overflow-visible transition-all",
                pkg.recommended
                  ? "border-2 border-accent-brand"
                  : "border border-border hover:border-accent-brand/40"
              )}
            >
              {pkg.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-brand px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap text-on-accent-brand uppercase">
                  Mais Popular
                </div>
              )}

              <CardHeader className="pb-0 text-center">
                <CardTitle className="text-base font-semibold">
                  {pkg.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col items-center gap-4 pt-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-md font-medium text-muted-foreground">
                      R$
                    </span>
                    <span className="text-score tracking-tight">
                      {pkg.price}
                    </span>
                    <span className="text-md font-medium text-muted-foreground">
                      ,90
                    </span>
                  </div>

                  <span className="text-small text-muted-foreground">
                    {pkg.count} análises • R${" "}
                    {pkg.pricePerAnalysis.toFixed(2).replace(".", ",")} cada
                  </span>

                  {pkg.savingsPercent > 0 && (
                    <span className="mt-1 inline-flex rounded-md bg-accent-success-light px-2 py-0.5 text-xs font-semibold text-accent-success-text">
                      Economize {pkg.savingsPercent}%
                    </span>
                  )}
                </div>

                <div className="h-px w-full bg-border" />

                <ul className="flex w-full flex-col gap-2">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-small text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-accent-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto pt-2">
                <Button
                  variant={pkg.recommended ? "brand" : "outline"}
                  className="w-full font-semibold"
                  size="lg"
                  loading={loadingPackageId === pkg.id}
                  onClick={() => handleSelectPackage(pkg.id)}
                >
                  Selecionar
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-small text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" />
          Análises sem validade
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Shield className="size-3.5" />
          Pagamento seguro via Stripe
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CreditCard className="size-3.5" />
          Cartão, Pix ou boleto
        </span>
      </div>
    </main>
  );
}
