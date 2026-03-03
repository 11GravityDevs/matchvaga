"use client";

import { useState } from "react";

import { CreditCard, Clock, Shield } from "lucide-react";

import { CheckoutPackagesGrid } from "@/components/shared/checkout-packages-grid";
import { type CheckoutPackageId } from "@/constants/checkout-packages";
import { useToastNotification } from "@/hooks/useToastNotification";

import { createCheckoutSession } from "../_actions/checkout";

export function CheckoutContent() {
  const [loadingPackageId, setLoadingPackageId] =
    useState<CheckoutPackageId | null>(null);
  const { showErrorToastNotification } = useToastNotification();

  const handleSelectPackage = async (id: CheckoutPackageId) => {
    setLoadingPackageId(id);

    try {
      const result = await createCheckoutSession({ packageId: id });

      if (result.success && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }

      setLoadingPackageId(null);
      showErrorToastNotification(
        result.error ?? "Erro ao iniciar checkout. Tente novamente."
      );
    } catch (error) {
      console.error(
        "[CheckoutContent] Unexpected error creating checkout session:",
        error
      );
      setLoadingPackageId(null);
      showErrorToastNotification("Erro ao iniciar checkout. Tente novamente.");
    }
  };

  return (
    <main className="flex w-full flex-col items-center section-gap page-padding">
      <div className="flex w-content flex-col gap-1">
        <h1 className="text-page-title">Comprar Análises</h1>
        <p className="text-page-subtitle">
          Escolha o pacote ideal para seu momento.
        </p>
      </div>

      <div className="flex w-content flex-col gap-10">
        <CheckoutPackagesGrid
          loadingPackageId={loadingPackageId}
          onSelectPackage={handleSelectPackage}
        />

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
            Cartão ou PIX
          </span>
        </div>
      </div>
    </main>
  );
}
