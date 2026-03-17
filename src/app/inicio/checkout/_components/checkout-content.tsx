"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { CheckoutPackagesGrid } from "@/components/shared/checkout-packages-grid";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPackageName,
  getPackagePriceCentavos,
  type CheckoutPackageId,
} from "@/constants/checkout-packages";
import { useToastNotification } from "@/hooks/use-toast-notification";
import { trackPricingViewedEvent } from "@/lib/analytics/posthog-events";
import { stripeCheckoutPromise } from "@/lib/stripe/checkout-client";
import { formatCentavosToBrl } from "@/utils/currency";

import { CHECKOUT_STRIPE_APPEARANCE } from "../_constants/checkout";
import { useCheckoutEffectiveState } from "../_hooks/use-checkout-effective-state";
import {
  useCheckoutSelectPackage,
  type CheckoutPaymentMethod,
} from "../_hooks/use-checkout-select-package";
import { CheckoutPackageSummaryCard } from "./checkout-package-summary-card";
import { CheckoutPageHeader } from "./checkout-page-header";
import { CheckoutPaymentForm } from "./checkout-payment-form";
import { CheckoutPaymentMethodSelector } from "./checkout-payment-method-selector";
import { CheckoutPixForm } from "./checkout-pix-form";
import { CheckoutTrustBadges } from "./checkout-trust-badges";

interface CheckoutContentProps {
  unlockAnalysisId?: string;
}

export function CheckoutContent({
  unlockAnalysisId,
}: CheckoutContentProps = {}) {
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod | null>(null);
  const [pendingPackageId, setPendingPackageId] =
    useState<CheckoutPackageId | null>(null);
  const [selectedPackageId, setSelectedPackageId] =
    useState<CheckoutPackageId | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<
    string | null
  >(null);
  const [pixPayment, setPixPayment] = useState<{
    paymentId: string;
    brCode: string;
    brCodeBase64: string;
    expiresAt?: string;
  } | null>(null);
  const unlockTriggeredRef = useRef(false);
  const { showErrorToastNotification } = useToastNotification();

  const onSuccess = useCallback(
    (
      data:
        | {
            paymentMethod: "stripe";
            clientSecret: string;
            packageId: CheckoutPackageId;
          }
        | {
            paymentMethod: "pix";
            packageId: CheckoutPackageId;
            paymentId: string;
            brCode: string;
            brCodeBase64: string;
            expiresAt?: string;
          }
    ) => {
      setPendingPackageId(null);
      setSelectedPackageId(data.packageId);
      if (data.paymentMethod === "pix") {
        setPixPayment({
          paymentId: data.paymentId,
          brCode: data.brCode,
          brCodeBase64: data.brCodeBase64,
          expiresAt: data.expiresAt,
        });
        setCheckoutClientSecret(null);
        return;
      }

      if (!stripeCheckoutPromise) {
        showErrorToastNotification(
          "Configuração de pagamento indisponível no cliente."
        );
        return;
      }

      setPixPayment(null);
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

  const handleChooseAnotherPackage = useCallback(() => {
    setPaymentMethod(null);
    setCheckoutClientSecret(null);
    setSelectedPackageId(null);
    setPixPayment(null);
    setPendingPackageId(null);
  }, []);

  const {
    effectivePixPayment,
    effectiveCheckoutClientSecret,
    effectivePendingPackageId,
    effectiveSelectedPackageId,
  } = useCheckoutEffectiveState({
    pixPayment,
    checkoutClientSecret,
    pendingPackageId,
    selectedPackageId,
    onChooseAnotherPackage: handleChooseAnotherPackage,
  });

  useEffect(() => {
    trackPricingViewedEvent();
  }, []);

  useEffect(() => {
    if (
      unlockAnalysisId &&
      !unlockTriggeredRef.current &&
      pendingPackageId === null
    ) {
      unlockTriggeredRef.current = true;
      queueMicrotask(() => setPendingPackageId("avulso"));
    }
  }, [unlockAnalysisId, pendingPackageId]);

  const handleBackToPackages = useCallback(() => {
    setPaymentMethod(null);
    setPendingPackageId(null);
  }, []);

  const showPackages =
    !effectiveCheckoutClientSecret &&
    !effectivePixPayment &&
    effectivePendingPackageId === null;

  const showPaymentChoice =
    !effectiveCheckoutClientSecret &&
    !effectivePixPayment &&
    effectivePendingPackageId !== null;

  const showPixForm =
    !!effectivePixPayment && effectiveSelectedPackageId !== null;

  const showStripeForm =
    !!stripeCheckoutPromise &&
    !!effectiveSelectedPackageId &&
    !!effectiveCheckoutClientSecret;

  const showUnavailableMessage = !showPixForm && !stripeCheckoutPromise;

  return (
    <main className="flex w-full flex-col items-center section-gap page-padding">
      <CheckoutPageHeader />

      <div className="flex w-content flex-col gap-10">
        {showPackages ? (
          <CheckoutPackagesGrid
            loadingPackageId={null}
            onSelectPackage={(id) => setPendingPackageId(id)}
          />
        ) : null}

        {showPaymentChoice && effectivePendingPackageId !== null ? (
          <div className="flex w-full max-w-content flex-col gap-8">
            <CheckoutPackageSummaryCard
              packageName={getPackageName(effectivePendingPackageId)}
              priceFormatted={formatCentavosToBrl(
                getPackagePriceCentavos(effectivePendingPackageId)
              )}
              onBack={handleBackToPackages}
            />
            <CheckoutPaymentMethodSelector
              paymentMethod={paymentMethod}
              loadingPackageId={loadingPackageId}
              pendingPackageId={effectivePendingPackageId}
              onSelectPix={() => {
                setPaymentMethod("pix");
                void handleSelectPackage(
                  effectivePendingPackageId,
                  unlockAnalysisId,
                  "pix"
                );
              }}
              onSelectStripe={() => {
                setPaymentMethod("stripe");
                void handleSelectPackage(
                  effectivePendingPackageId,
                  unlockAnalysisId,
                  "stripe"
                );
              }}
            />
          </div>
        ) : null}

        {showPixForm && effectivePixPayment && effectiveSelectedPackageId ? (
          <CheckoutPixForm
            paymentId={effectivePixPayment.paymentId}
            brCode={effectivePixPayment.brCode}
            brCodeBase64={effectivePixPayment.brCodeBase64}
            expiresAt={effectivePixPayment.expiresAt}
            packageName={getPackageName(effectiveSelectedPackageId)}
            priceFormatted={formatCentavosToBrl(
              getPackagePriceCentavos(effectiveSelectedPackageId)
            )}
            unlockAnalysisId={unlockAnalysisId}
          />
        ) : showUnavailableMessage ? (
          <Card className="w-full border border-border">
            <CardContent className="pt-6">
              <p className="text-small text-muted-foreground">
                Configuração de pagamento indisponível.{" "}
                <button
                  type="button"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                  onClick={handleChooseAnotherPackage}
                >
                  Escolher outro pacote
                </button>
              </p>
            </CardContent>
          </Card>
        ) : showStripeForm &&
          effectiveCheckoutClientSecret &&
          effectiveSelectedPackageId ? (
          <CheckoutProvider
            stripe={stripeCheckoutPromise}
            options={{
              clientSecret: effectiveCheckoutClientSecret,
              elementsOptions: {
                appearance: CHECKOUT_STRIPE_APPEARANCE,
              },
            }}
          >
            <CheckoutPaymentForm
              packageId={effectiveSelectedPackageId}
              onChooseAnotherPackage={handleChooseAnotherPackage}
              onPaymentSuccess={handleChooseAnotherPackage}
            />
          </CheckoutProvider>
        ) : null}

        <CheckoutTrustBadges />
      </div>
    </main>
  );
}
