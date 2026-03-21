"use client";

import { useRouter } from "next/navigation";

import { CheckoutPackagesGrid } from "@/components/shared/checkout-packages-grid";
import {
  type CheckoutPackageId,
  getCreditsForPackage,
  getPackagePriceCentavos,
} from "@/constants/checkout-packages";
import { ROUTE_LOGIN, ROUTE_HOME_CHECKOUT } from "@/constants/routes";
import { useAuthContext } from "@/contexts/auth-context";
import { trackPricingPackageSelectedEvent } from "@/lib/analytics/posthog-events";

import { AnimateOnScroll } from "./animate-on-scroll";

export function PricingSection() {
  const { isLoggedIn } = useAuthContext();
  const router = useRouter();

  const handleSelectPackage = (id: CheckoutPackageId) => {
    if (!isLoggedIn) {
      router.push(ROUTE_LOGIN);
      return;
    }

    const credits = getCreditsForPackage(id);
    const priceCentavos = getPackagePriceCentavos(id);
    trackPricingPackageSelectedEvent(id, credits, priceCentavos);

    router.push(`${ROUTE_HOME_CHECKOUT}?package=${id}`);
  };

  return (
    <section
      id="precos"
      className="flex w-full flex-col items-center gap-8 bg-surface-subtle py-12 md:scroll-mt-12 md:gap-12 md:py-20"
    >
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4">
          <span className="rounded-full border border-accent-brand px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            PREÇOS
          </span>
          <h2 className="text-center text-section-header-large">
            Sem assinatura. Use no seu ritmo.
          </h2>
          <p className="text-center text-base leading-normal text-muted-foreground">
            Compre créditos apenas quando precisar, sem mensalidade e sem
            expiração. Pagamento por PIX ou cartão de crédito.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll delay={80} className="flex w-full flex-col gap-5">
        <CheckoutPackagesGrid
          loadingPackageId={null}
          onSelectPackage={handleSelectPackage}
        />
      </AnimateOnScroll>
    </section>
  );
}
