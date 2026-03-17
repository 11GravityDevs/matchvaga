"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import type { Appearance } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";

import { unlockAnalysis } from "@/app/actions/document-preview";
import { cn } from "@/utils/style";
import { createCheckoutSession } from "@/app/inicio/checkout/_actions/checkout";
import { createPixCharge } from "@/app/inicio/checkout/_actions/create-pix-charge";
import { CheckoutPaymentForm } from "@/app/inicio/checkout/_components/checkout-payment-form";
import { CheckoutPixForm } from "@/app/inicio/checkout/_components/checkout-pix-form";
import { UnlockPaymentMethodStep } from "./unlock-payment-method-step";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPackageName,
  getPackagePriceCentavos,
} from "@/constants/checkout-packages";
import {
  QUERY_KEY_ANALYSES,
  QUERY_KEY_CURRENT_USER_DISPLAY,
} from "@/constants/query-keys";
import {
  trackCheckoutCompletedEvent,
  trackCheckoutStartedEvent,
} from "@/lib/analytics/posthog-events";
import { stripeCheckoutPromise } from "@/lib/stripe/checkout-client";
import { useQueryClient } from "@tanstack/react-query";

const UNLOCK_RETRY_DELAY_MS = 3000;
const UNLOCK_MAX_RETRIES = 5;
const PACKAGE_AVULSO = "avulso" as const;

const checkoutAppearance: Appearance = {
  theme: "stripe",
  inputs: "spaced",
  labels: "above",
};

const brlFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
function formatCentavosToBrl(c: number): string {
  return brlFormat.format(c / 100);
}

interface UnlockPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  onUnlockSuccess: () => void;
  initialProcessingFromRedirect?: { sessionId: string };
}

type ModalState =
  | "method"
  | "loading"
  | "form"
  | "pix"
  | "processing"
  | "success"
  | "error";

export function UnlockPaymentModal({
  open,
  onOpenChange,
  analysisId,
  onUnlockSuccess,
  initialProcessingFromRedirect,
}: UnlockPaymentModalProps) {
  const queryClient = useQueryClient();

  const [state, setState] = useState<ModalState>("method");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [pixPayment, setPixPayment] = useState<{
    paymentId: string;
    brCode: string;
    brCodeBase64: string;
    expiresAt?: string;
  } | null>(null);
  const [loadingMethod, setLoadingMethod] = useState<"stripe" | "pix" | null>(
    null
  );

  const attemptRef = useRef(0);
  const hasTrackedRedirectRef = useRef(false);
  const onUnlockSuccessRef = useRef(onUnlockSuccess);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onUnlockSuccessRef.current = onUnlockSuccess;
    onOpenChangeRef.current = onOpenChange;
  }, [onUnlockSuccess, onOpenChange]);

  const effectiveState: ModalState =
    open && initialProcessingFromRedirect && state === "loading"
      ? "processing"
      : state;

  const resetState = useCallback(() => {
    setState("method");
    setClientSecret(null);
    setSessionId(null);
    setErrorMessage(null);
    setIsPaymentSubmitting(false);
    setPixPayment(null);
    setLoadingMethod(null);
    attemptRef.current = 0;
    hasTrackedRedirectRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => resetState());
      return;
    }
    if (open && initialProcessingFromRedirect && state === "method") {
      const timeoutId = setTimeout(() => setState("loading"), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open, initialProcessingFromRedirect, state, resetState]);

  const handleSelectCard = useCallback(async () => {
    setLoadingMethod("stripe");
    setState("loading");
    const priceCentavos = getPackagePriceCentavos(PACKAGE_AVULSO);
    trackCheckoutStartedEvent(PACKAGE_AVULSO, priceCentavos, "stripe");

    const result = await createCheckoutSession({
      packageId: PACKAGE_AVULSO,
      analysisId,
      returnToModal: true,
    });

    setLoadingMethod(null);

    if (result.success && result.clientSecret) {
      setClientSecret(result.clientSecret);
      if (result.sessionId) setSessionId(result.sessionId);
      setState("form");
    } else {
      setErrorMessage(
        result.error ?? "Erro ao iniciar checkout. Tente novamente."
      );
      setState("error");
    }
  }, [analysisId]);

  const handleSelectPix = useCallback(async () => {
    setLoadingMethod("pix");
    setState("loading");
    const priceCentavos = getPackagePriceCentavos(PACKAGE_AVULSO);
    trackCheckoutStartedEvent(PACKAGE_AVULSO, priceCentavos, "pix");

    const result = await createPixCharge({
      packageId: PACKAGE_AVULSO,
      analysisId,
    });

    setLoadingMethod(null);

    if (
      result.success &&
      result.paymentId &&
      result.brCode &&
      result.brCodeBase64
    ) {
      setPixPayment({
        paymentId: result.paymentId,
        brCode: result.brCode,
        brCodeBase64: result.brCodeBase64,
        expiresAt: result.expiresAt,
      });
      setState("pix");
    } else {
      setErrorMessage(
        result.error ?? "Erro ao iniciar checkout PIX. Tente novamente."
      );
      setState("error");
    }
  }, [analysisId]);

  const handlePaymentSuccess = useCallback(() => {
    setState("processing");
    if (sessionId) trackCheckoutCompletedEvent(sessionId, "stripe");
  }, [sessionId]);

  useEffect(() => {
    if (
      initialProcessingFromRedirect?.sessionId &&
      !hasTrackedRedirectRef.current
    ) {
      hasTrackedRedirectRef.current = true;
      trackCheckoutCompletedEvent(
        initialProcessingFromRedirect.sessionId,
        "stripe"
      );
    }
  }, [initialProcessingFromRedirect]);

  useEffect(() => {
    if (effectiveState !== "processing") return;

    let cancelled = false;

    const runUnlock = async () => {
      const result = await unlockAnalysis(analysisId);

      if (cancelled) return;

      if (result.success) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY_ANALYSES });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
        });
        setState("success");
        onUnlockSuccessRef.current();
        onOpenChangeRef.current(false);
        return;
      }

      attemptRef.current += 1;
      if (attemptRef.current < UNLOCK_MAX_RETRIES) {
        setTimeout(() => {
          if (!cancelled) void runUnlock();
        }, UNLOCK_RETRY_DELAY_MS);
      } else {
        setErrorMessage(
          "Não foi possível desbloquear automaticamente. Recarregue a página e tente novamente."
        );
        setState("error");
      }
    };

    void runUnlock();

    return () => {
      cancelled = true;
    };
  }, [effectiveState, analysisId, queryClient]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      const cannotClose =
        effectiveState === "loading" ||
        effectiveState === "processing" ||
        isPaymentSubmitting;
      if (!newOpen && cannotClose) return;
      onOpenChange(newOpen);
    },
    [effectiveState, isPaymentSubmitting, onOpenChange]
  );

  const handleRetry = useCallback(() => {
    resetState();
  }, [resetState]);

  if (!stripeCheckoutPromise && effectiveState === "form") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Desbloquear currículo</DialogTitle>
          </DialogHeader>
          <p className="text-small text-muted-foreground">
            Configuração de pagamento indisponível no cliente.
          </p>
          <Button
            variant="outline"
            size="brand"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          effectiveState === "loading" ||
            effectiveState === "processing" ||
            effectiveState === "error" ||
            effectiveState === "method"
            ? "max-w-lg"
            : "max-w-3xl"
        )}
      >
        <DialogHeader>
          <DialogTitle>Desbloquear currículo</DialogTitle>
        </DialogHeader>

        {effectiveState === "method" && (
          <UnlockPaymentMethodStep
            loadingMethod={loadingMethod}
            onSelectPix={handleSelectPix}
            onSelectCard={handleSelectCard}
            packageName={getPackageName(PACKAGE_AVULSO)}
            priceFormatted={formatCentavosToBrl(
              getPackagePriceCentavos(PACKAGE_AVULSO)
            )}
          />
        )}

        {effectiveState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="size-10 animate-spin text-muted-foreground" />
            <p className="text-small text-muted-foreground">
              Preparando pagamento...
            </p>
          </div>
        )}

        {effectiveState === "form" && clientSecret && stripeCheckoutPromise && (
          <CheckoutProvider
            stripe={stripeCheckoutPromise}
            options={{
              clientSecret,
              elementsOptions: {
                appearance: checkoutAppearance,
              },
            }}
          >
            <CheckoutPaymentForm
              packageId={PACKAGE_AVULSO}
              onChooseAnotherPackage={() => onOpenChange(false)}
              chooseAnotherLabel="Cancelar"
              onPaymentSuccess={handlePaymentSuccess}
              onSubmittingChange={setIsPaymentSubmitting}
            />
          </CheckoutProvider>
        )}

        {effectiveState === "pix" && pixPayment && (
          <CheckoutPixForm
            paymentId={pixPayment.paymentId}
            brCode={pixPayment.brCode}
            brCodeBase64={pixPayment.brCodeBase64}
            expiresAt={pixPayment.expiresAt}
            packageName={getPackageName(PACKAGE_AVULSO)}
            priceFormatted={formatCentavosToBrl(
              getPackagePriceCentavos(PACKAGE_AVULSO)
            )}
            unlockAnalysisId={analysisId}
          />
        )}

        {effectiveState === "processing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="size-10 animate-spin text-accent-success" />
            <p className="text-center text-section-header text-foreground">
              Pagamento processado
            </p>
            <p className="text-center text-small text-muted-foreground">
              Desbloqueando seu currículo...
            </p>
          </div>
        )}

        {effectiveState === "error" && (
          <div className="flex flex-col gap-4">
            <p className="text-small text-destructive">{errorMessage}</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="brand"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
              <Button variant="brand" size="brand" onClick={handleRetry}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
