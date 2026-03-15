"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CHECKOUT_PACKAGE_IDS,
  type CheckoutPackageId,
  getCreditsForPackage,
  getPackageName,
  getPackagePriceCentavos,
} from "@/constants/checkout-packages";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/style";

const RECOMMENDED_PACKAGE_ID: CheckoutPackageId = "padrao";
const BASE_PACKAGE_ID: CheckoutPackageId = "entrada";

const DISPLAYED_PACKAGE_IDS = CHECKOUT_PACKAGE_IDS.filter(
  (id) => id !== "avulso"
);

const BASE_PRICE_PER_ANALYSIS_CENTAVOS =
  getPackagePriceCentavos(BASE_PACKAGE_ID) /
  getCreditsForPackage(BASE_PACKAGE_ID);

const FEATURES: Record<CheckoutPackageId, string[]> = {
  avulso: ["1 análise avulsa", "Sem validade"],
  entrada: ["Ideal para experimentar", "Sem validade"],
  basico: ["Bom para busca ativa", "Sem validade"],
  padrao: ["Melhor custo-benefício", "Sem validade", "Prioridade no suporte"],
  profissional: [
    "Para quem aplica constantemente",
    "Sem validade",
    "Prioridade no suporte",
  ],
};

interface CheckoutPackagesGridProps {
  loadingPackageId: CheckoutPackageId | null;
  onSelectPackage: (id: CheckoutPackageId) => void;
}

export function CheckoutPackagesGrid({
  loadingPackageId,
  onSelectPackage,
}: CheckoutPackagesGridProps) {
  return (
    <>
      <div className="grid w-full grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DISPLAYED_PACKAGE_IDS.map((packageId) => {
          const name = getPackageName(packageId);
          const priceCentavos = getPackagePriceCentavos(packageId);
          const credits = getCreditsForPackage(packageId);
          const priceInteger = Math.floor(priceCentavos / 100);
          const priceDecimal = String(priceCentavos % 100).padStart(2, "0");

          const pricePerAnalysisCentavos = priceCentavos / credits;
          const pricePerAnalysisReais = pricePerAnalysisCentavos / 100;
          const formattedPricePerAnalysis = pricePerAnalysisReais
            .toFixed(2)
            .replace(".", ",");

          const savingsPercent =
            packageId === BASE_PACKAGE_ID
              ? 0
              : Math.round(
                  ((BASE_PRICE_PER_ANALYSIS_CENTAVOS -
                    pricePerAnalysisCentavos) /
                    BASE_PRICE_PER_ANALYSIS_CENTAVOS) *
                    100
                );

          const features = FEATURES[packageId];
          const isRecommended = packageId === RECOMMENDED_PACKAGE_ID;

          return (
            <Card
              key={packageId}
              className={cn(
                "relative flex flex-col overflow-visible transition-all",
                isRecommended
                  ? "border-2 border-accent-brand"
                  : "border border-border hover:border-accent-brand/80"
              )}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-brand px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap text-on-accent-brand uppercase">
                  Mais Popular
                </div>
              )}

              <CardHeader className="pb-0 text-center">
                <CardTitle className="text-base font-semibold">
                  {name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col items-center gap-4 pt-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-md font-medium text-muted-foreground">
                      R$
                    </span>
                    <span className="text-price tracking-tight">
                      {priceInteger}
                    </span>
                    <span className="text-md font-medium text-muted-foreground">
                      ,{priceDecimal}
                    </span>
                  </div>

                  <span className="text-md text-muted-foreground">
                    <span className="font-semibold text-accent-brand">
                      {credits} análises
                    </span>{" "}
                    • R$ {formattedPricePerAnalysis} cada
                  </span>

                  {savingsPercent > 0 && (
                    <span className="mt-1 inline-flex rounded-md bg-accent-success-light px-2 py-0.5 text-xs font-semibold text-accent-success-text">
                      Economize {savingsPercent}%
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
                  variant={isRecommended ? "brand" : "outline"}
                  className="w-full font-semibold"
                  size="lg"
                  loading={loadingPackageId === packageId}
                  onClick={() => onSelectPackage(packageId)}
                >
                  Comprar
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
