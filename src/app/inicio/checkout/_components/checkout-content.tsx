"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import type { Appearance } from "@stripe/stripe-js";
import { Clock, CreditCard, Loader2, QrCode, Shield } from "lucide-react";

import { CheckoutPackagesGrid } from "@/components/shared/checkout-packages-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  getPackageName,
  getPackagePriceCentavos,
  type CheckoutPackageId,
} from "@/constants/checkout-packages";
import { useToastNotification } from "@/hooks/use-toast-notification";
import { trackPricingViewedEvent } from "@/lib/analytics/posthog-events";
import { stripeCheckoutPromise } from "@/lib/stripe/checkout-client";
import { cn } from "@/utils/style";

import { CHECKOUT_PIX_JUST_PAID_KEY } from "../_constants/checkout";
import {
  useCheckoutSelectPackage,
  type CheckoutPaymentMethod,
} from "../_hooks/use-checkout-select-package";
import { CheckoutPaymentForm } from "./checkout-payment-form";
import { CheckoutPixForm } from "./checkout-pix-form";

const checkoutAppearance: Appearance = {
  theme: "stripe",
  inputs: "spaced",
  labels: "above",
};

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCentavosToBrl(amountCentavos: number): string {
  return brlFormatter.format(amountCentavos / 100);
}

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

  const handleChooseAnotherPackage = useCallback(() => {
    setPaymentMethod(null);
    setCheckoutClientSecret(null);
    setSelectedPackageId(null);
    setPixPayment(null);
    setPendingPackageId(null);
  }, []);

  const resetFromSuccess =
    typeof window !== "undefined" &&
    (() => {
      try {
        return !!sessionStorage.getItem(CHECKOUT_PIX_JUST_PAID_KEY);
      } catch {
        return false;
      }
    })();

  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        sessionStorage.getItem(CHECKOUT_PIX_JUST_PAID_KEY)
      ) {
        sessionStorage.removeItem(CHECKOUT_PIX_JUST_PAID_KEY);
        queueMicrotask(() => handleChooseAnotherPackage());
      }
    } catch {
      // ignore
    }
  }, [handleChooseAnotherPackage]);

  const effectivePixPayment = resetFromSuccess ? null : pixPayment;
  const effectiveCheckoutClientSecret = resetFromSuccess
    ? null
    : checkoutClientSecret;
  const effectivePendingPackageId = resetFromSuccess ? null : pendingPackageId;
  const effectiveSelectedPackageId = resetFromSuccess
    ? null
    : selectedPackageId;

  const handleBackToPackages = () => {
    setPaymentMethod(null);
    setPendingPackageId(null);
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
        {!effectiveCheckoutClientSecret &&
        !effectivePixPayment &&
        effectivePendingPackageId === null ? (
          <CheckoutPackagesGrid
            loadingPackageId={null}
            onSelectPackage={(id) => setPendingPackageId(id)}
          />
        ) : null}

        {!effectiveCheckoutClientSecret &&
        !effectivePixPayment &&
        effectivePendingPackageId !== null ? (
          <div className="flex w-full max-w-content flex-col gap-8">
            <Card className="w-full border border-border">
              <CardContent className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>Finalizar compra do pacote</CardTitle>
                  <span className="text-base font-semibold text-accent-brand">
                    {getPackageName(effectivePendingPackageId)}
                  </span>
                </div>
                <span className="text-xl font-bold">
                  {formatCentavosToBrl(
                    getPackagePriceCentavos(effectivePendingPackageId)
                  )}
                </span>
              </CardContent>
              <CardFooter className="justify-end border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="brand"
                  type="button"
                  onClick={handleBackToPackages}
                >
                  Escolher outro pacote
                </Button>
              </CardFooter>
            </Card>

            <div className="flex flex-col gap-4">
              <h2 className="text-section-header text-foreground">
                Como deseja pagar?
              </h2>
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("pix");
                    void handleSelectPackage(
                      effectivePendingPackageId,
                      unlockAnalysisId,
                      "pix"
                    );
                  }}
                  disabled={loadingPackageId !== null}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border-2 p-6 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
                    paymentMethod === "pix"
                      ? "border-accent-brand bg-accent-brand-light/50 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/30"
                  )}
                  aria-pressed={paymentMethod === "pix"}
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-lg",
                      paymentMethod === "pix"
                        ? "bg-accent-brand text-on-accent-brand"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {loadingPackageId !== null &&
                    loadingPackageId === effectivePendingPackageId &&
                    paymentMethod === "pix" ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      <QrCode className="size-6" />
                    )}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-card-title text-foreground">PIX</span>
                    <span className="text-small text-muted-foreground">
                      Pagamento instantâneo via QR Code ou copia e cola
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("stripe");
                    void handleSelectPackage(
                      effectivePendingPackageId,
                      unlockAnalysisId,
                      "stripe"
                    );
                  }}
                  disabled={loadingPackageId !== null}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border-2 p-6 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
                    paymentMethod === "stripe"
                      ? "border-accent-brand bg-accent-brand-light/50 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/30"
                  )}
                  aria-pressed={paymentMethod === "stripe"}
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-lg",
                      paymentMethod === "stripe"
                        ? "bg-accent-brand text-on-accent-brand"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {loadingPackageId !== null &&
                    loadingPackageId === effectivePendingPackageId &&
                    paymentMethod === "stripe" ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      <CreditCard className="size-6" />
                    )}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-card-title text-foreground">
                      Cartão de crédito
                    </span>
                    <span className="text-small text-muted-foreground">
                      Parcelamento em até 12x no cartão
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {effectivePixPayment && effectiveSelectedPackageId ? (
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
        ) : !stripeCheckoutPromise ? (
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
        ) : effectiveSelectedPackageId && effectiveCheckoutClientSecret ? (
          <CheckoutProvider
            stripe={stripeCheckoutPromise}
            options={{
              clientSecret: effectiveCheckoutClientSecret,
              elementsOptions: {
                appearance: checkoutAppearance,
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

        <div className="flex flex-wrap items-center justify-center gap-6 text-small text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Análises sem validade
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="size-3.5" />
            Pagamento seguro
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
