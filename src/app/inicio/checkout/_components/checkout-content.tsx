"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import type { Appearance } from "@stripe/stripe-js";
import { CreditCard, Clock, Shield } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CheckoutPackagesGrid } from "@/components/shared/checkout-packages-grid";
import type { CheckoutPackageId } from "@/constants/checkout-packages";
import { trackPricingViewedEvent } from "@/lib/analytics/posthog-events";
import { stripeCheckoutPromise } from "@/lib/stripe/checkout-client";
import { useToastNotification } from "@/hooks/use-toast-notification";

import { useCheckoutSelectPackage } from "../_hooks/use-checkout-select-package";
import { CheckoutPaymentForm } from "./checkout-payment-form";

const checkoutAppearance: Appearance = {
  theme: "stripe",
  inputs: "spaced",
  labels: "above",
};

interface CheckoutContentProps {
  unlockAnalysisId?: string;
}

export function CheckoutContent({
  unlockAnalysisId,
}: CheckoutContentProps = {}) {
  const [selectedPackageId, setSelectedPackageId] =
    useState<CheckoutPackageId | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<
    string | null
  >(null);
  const unlockTriggeredRef = useRef(false);
  const { showErrorToastNotification } = useToastNotification();

  const onSuccess = useCallback(
    (data: { clientSecret: string; packageId: CheckoutPackageId }) => {
      if (!stripeCheckoutPromise) {
        showErrorToastNotification(
          "Configuração de pagamento indisponível no cliente."
        );
        return;
      }
      setSelectedPackageId(data.packageId);
      setCheckoutClientSecret(data.clientSecret);
    },
    [showErrorToastNotification]
  );

  const onError = useCallback(
    (message: string) => {
      showErrorToastNotification(message);
    },
    [showErrorToastNotification]
  );

  const { loadingPackageId, handleSelectPackage } = useCheckoutSelectPackage({
    onSuccess,
    onError,
  });

  useEffect(() => {
    trackPricingViewedEvent();
  }, []);

  useEffect(() => {
    if (
      unlockAnalysisId &&
      !unlockTriggeredRef.current &&
      !checkoutClientSecret
    ) {
      unlockTriggeredRef.current = true;
      void handleSelectPackage("avulso", unlockAnalysisId);
    }
  }, [unlockAnalysisId, checkoutClientSecret, handleSelectPackage]);

  return (
    <main className="flex w-full flex-col items-center section-gap page-padding">
      <div className="flex w-content flex-col gap-1">
        <h1 className="text-page-title">Comprar Análises</h1>
        <p className="text-page-subtitle">
          Escolha o pacote ideal para seu momento.
        </p>
      </div>

      <div className="flex w-content flex-col gap-10">
        {!checkoutClientSecret ? (
          <CheckoutPackagesGrid
            loadingPackageId={loadingPackageId}
            onSelectPackage={handleSelectPackage}
          />
        ) : !stripeCheckoutPromise ? (
          <Card className="w-full border border-border">
            <CardContent className="pt-6">
              <p className="text-small text-muted-foreground">
                Configuração de pagamento indisponível.{" "}
                <button
                  type="button"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                  onClick={() => {
                    setCheckoutClientSecret(null);
                    setSelectedPackageId(null);
                  }}
                >
                  Escolher outro pacote
                </button>
              </p>
            </CardContent>
          </Card>
        ) : selectedPackageId ? (
          <CheckoutProvider
            stripe={stripeCheckoutPromise}
            options={{
              clientSecret: checkoutClientSecret,
              elementsOptions: {
                appearance: checkoutAppearance,
              },
            }}
          >
            <CheckoutPaymentForm
              packageId={selectedPackageId}
              onChooseAnotherPackage={() => {
                setCheckoutClientSecret(null);
                setSelectedPackageId(null);
              }}
            />
          </CheckoutProvider>
        ) : null}

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
