"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import type { Appearance } from "@stripe/stripe-js";
import { CreditCard, Clock, Loader2, QrCode, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/style";
import { CheckoutPackagesGrid } from "@/components/shared/checkout-packages-grid";
import {
  getPackageName,
  getPackagePriceCentavos,
  type CheckoutPackageId,
} from "@/constants/checkout-packages";
import { trackPricingViewedEvent } from "@/lib/analytics/posthog-events";
import { stripeCheckoutPromise } from "@/lib/stripe/checkout-client";
import { useToastNotification } from "@/hooks/use-toast-notification";

import {
  type CheckoutPaymentMethod,
  useCheckoutSelectPackage,
} from "../_hooks/use-checkout-select-package";
import { CheckoutPixForm } from "./checkout-pix-form";
import { CheckoutPaymentForm } from "./checkout-payment-form";

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

  const handleChooseAnotherPackage = () => {
    setPaymentMethod(null);
    setCheckoutClientSecret(null);
    setSelectedPackageId(null);
    setPixPayment(null);
    setPendingPackageId(null);
  };

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
        {!checkoutClientSecret && !pixPayment && pendingPackageId === null ? (
          <CheckoutPackagesGrid
            loadingPackageId={null}
            onSelectPackage={(id) => setPendingPackageId(id)}
          />
        ) : null}

        {!checkoutClientSecret && !pixPayment && pendingPackageId !== null ? (
          <div className="flex w-full max-w-content flex-col gap-8">
            <Card className="w-full border border-border">
              <CardContent className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>Finalizar compra do pacote</CardTitle>
                  <span className="text-base font-semibold text-accent-brand">
                    {getPackageName(pendingPackageId)}
                  </span>
                </div>
                <span className="text-xl font-bold">
                  {formatCentavosToBrl(
                    getPackagePriceCentavos(pendingPackageId)
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
                      pendingPackageId,
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
                    loadingPackageId === pendingPackageId &&
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
                      pendingPackageId,
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
                    loadingPackageId === pendingPackageId &&
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

        {pixPayment && selectedPackageId ? (
          <CheckoutPixForm
            paymentId={pixPayment.paymentId}
            brCode={pixPayment.brCode}
            brCodeBase64={pixPayment.brCodeBase64}
            expiresAt={pixPayment.expiresAt}
            packageName={getPackageName(selectedPackageId)}
            priceFormatted={formatCentavosToBrl(
              getPackagePriceCentavos(selectedPackageId)
            )}
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
        ) : selectedPackageId && checkoutClientSecret ? (
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
              onChooseAnotherPackage={handleChooseAnotherPackage}
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
