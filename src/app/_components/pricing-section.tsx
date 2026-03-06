"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CheckoutPackagesGrid } from "@/components/shared/checkout-packages-grid";
import {
  type CheckoutPackageId,
  getCreditsForPackage,
  getPackagePriceCentavos,
} from "@/constants/checkout-packages";
import { ROUTE_LOGIN } from "@/constants/routes";
import { useAuthContext } from "@/contexts/auth-context";
import {
  trackCheckoutStartedEvent,
  trackPricingPackageSelectedEvent,
} from "@/lib/analytics/posthog-events";
import { useToastNotification } from "@/hooks/useToastNotification";

import { AnimateOnScroll } from "./animate-on-scroll";
import { createCheckoutSession } from "../inicio/checkout/_actions/checkout";

export function PricingSection() {
  const [loadingPackageId, setLoadingPackageId] =
    useState<CheckoutPackageId | null>(null);
  const { isLoggedIn } = useAuthContext();
  const router = useRouter();
  const { showErrorToastNotification } = useToastNotification();

  const handleSelectPackage = async (id: CheckoutPackageId) => {
    // TODO(lancamento): remover redirecionamento para /em-breve e reativar fluxo de checkout
    router.push("/em-breve");
    return;

    if (!isLoggedIn) {
      router.push(ROUTE_LOGIN);
      return;
    }

    const credits = getCreditsForPackage(id);
    const priceCentavos = getPackagePriceCentavos(id);
    trackPricingPackageSelectedEvent(id, credits, priceCentavos);
    trackCheckoutStartedEvent(id, priceCentavos);

    setLoadingPackageId(id);

    try {
      const result = await createCheckoutSession({ packageId: id });

      if (result.success && result.checkoutUrl) {
        // window.location.assign(result.checkoutUrl);
        return;
      }

      setLoadingPackageId(null);
      showErrorToastNotification(
        result.error ?? "Erro ao iniciar checkout. Tente novamente."
      );
    } catch (error) {
      console.error(
        "[PricingSection] Unexpected error creating checkout session:",
        error
      );
      setLoadingPackageId(null);
      showErrorToastNotification("Erro ao iniciar checkout. Tente novamente.");
    }
  };

  return (
    <section
      id="precos"
      className="flex w-full flex-col items-center gap-8 bg-surface-subtle py-12 md:scroll-mt-12 md:gap-12 md:py-20"
    >
      <div className="mx-auto flex w-full max-w-landing-content flex-col items-center gap-8 px-4 md:gap-12 md:px-0">
        <AnimateOnScroll>
          <div className="flex max-w-section-header flex-col items-center gap-4">
            <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
              PREÇOS
            </span>
            <h2 className="text-center text-section-header-large">
              Preços que cabem no seu bolso
            </h2>
            <p className="text-center text-base leading-normal text-muted-foreground">
              Comece grátis. Faça upgrade quando estiver pronto.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={80} className="flex w-full flex-col gap-5">
          <CheckoutPackagesGrid
            loadingPackageId={loadingPackageId}
            onSelectPackage={handleSelectPackage}
          />
        </AnimateOnScroll>
      </div>
    </section>
  );
}
