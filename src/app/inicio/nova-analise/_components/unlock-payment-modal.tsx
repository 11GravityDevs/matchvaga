"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";

import { createCheckoutSession } from "@/app/inicio/checkout/_actions/checkout";
import { createPixCharge } from "@/app/inicio/checkout/_actions/create-pix-charge";
import { CHECKOUT_STRIPE_APPEARANCE } from "@/app/inicio/checkout/_constants/checkout";
import { CheckoutPaymentForm } from "@/app/inicio/checkout/_components/checkout-payment-form";
import { CheckoutPixForm } from "@/app/inicio/checkout/_components/checkout-pix-form";
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
  trackCheckoutCompletedEvent,
  trackCheckoutStartedEvent,
} from "@/lib/analytics/posthog-events";
import { stripeCheckoutPromise } from "@/lib/stripe/checkout-client";
import { cn } from "@/utils/style";
import { formatCentavosToBrl } from "@/utils/currency";

import { UNLOCK_PACKAGE_ID } from "../_constants/unlock";
import { useUnlockProcessing } from "../_hooks/use-unlock-processing";
import { UnlockErrorView } from "./unlock-error-view";
import { UnlockLoadingView } from "./unlock-loading-view";
import { UnlockPaymentMethodStep } from "./unlock-payment-method-step";
import { UnlockProcessingView } from "./unlock-processing-view";

const CHECKOUT_ERROR = "Erro ao iniciar checkout. Tente novamente.";
const PIX_ERROR = "Erro ao iniciar checkout PIX. Tente novamente.";

type ModalState =
  | "method"
  | "loading"
  | "form"
  | "pix"
  | "processing"
  | "success"
  | "error";

interface UnlockPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  onUnlockSuccess: () => void;
  initialProcessingFromRedirect?: { sessionId: string };
}

export function UnlockPaymentModal({
  open,
  onOpenChange,
  analysisId,
  onUnlockSuccess,
  initialProcessingFromRedirect,
}: UnlockPaymentModalProps) {
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

  const handleUnlockSuccess = useCallback(() => {
    setState("success");
    onUnlockSuccessRef.current();
    onOpenChangeRef.current(false);
  }, []);

  const handleUnlockError = useCallback((message: string) => {
    setErrorMessage(message);
    setState("error");
  }, []);

  useUnlockProcessing(analysisId, effectiveState === "processing", {
    onSuccess: handleUnlockSuccess,
    onError: handleUnlockError,
  });

  const handleSelectCard = useCallback(async () => {
    setLoadingMethod("stripe");
    setState("loading");
    const priceCentavos = getPackagePriceCentavos(UNLOCK_PACKAGE_ID);
    trackCheckoutStartedEvent(UNLOCK_PACKAGE_ID, priceCentavos, "stripe");

    const result = await createCheckoutSession({
      packageId: UNLOCK_PACKAGE_ID,
      analysisId,
      returnToModal: true,
    });

    setLoadingMethod(null);

    if (result.success && result.clientSecret) {
      setClientSecret(result.clientSecret);
      if (result.sessionId) setSessionId(result.sessionId);
      setState("form");
    } else {
      setErrorMessage(result.error ?? CHECKOUT_ERROR);
      setState("error");
    }
  }, [analysisId]);

  const handleSelectPix = useCallback(async () => {
    setLoadingMethod("pix");
    setState("loading");
    const priceCentavos = getPackagePriceCentavos(UNLOCK_PACKAGE_ID);
    trackCheckoutStartedEvent(UNLOCK_PACKAGE_ID, priceCentavos, "pix");

    const result = await createPixCharge({
      packageId: UNLOCK_PACKAGE_ID,
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
      setErrorMessage(result.error ?? PIX_ERROR);
      setState("error");
    }
  }, [analysisId]);

  const handlePaymentSuccess = useCallback(() => {
    setState("processing");
    if (sessionId) trackCheckoutCompletedEvent(sessionId, "stripe");
  }, [sessionId]);

  const handlePixPaymentSuccess = useCallback(() => {
    setState("processing");
    if (pixPayment?.paymentId) {
      trackCheckoutCompletedEvent(pixPayment.paymentId, "pix");
    }
  }, [pixPayment]);

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

  const isCompactContent =
    effectiveState === "loading" ||
    effectiveState === "processing" ||
    effectiveState === "error" ||
    effectiveState === "method";

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
        className={cn(isCompactContent ? "max-w-lg" : "max-w-3xl")}
      >
        <DialogHeader>
          <DialogTitle>Desbloquear currículo</DialogTitle>
        </DialogHeader>

        {effectiveState === "method" && (
          <UnlockPaymentMethodStep
            loadingMethod={loadingMethod}
            onSelectPix={handleSelectPix}
            onSelectCard={handleSelectCard}
            packageName={getPackageName(UNLOCK_PACKAGE_ID)}
            priceFormatted={formatCentavosToBrl(
              getPackagePriceCentavos(UNLOCK_PACKAGE_ID)
            )}
          />
        )}

        {effectiveState === "loading" && <UnlockLoadingView />}

        {effectiveState === "form" && clientSecret && stripeCheckoutPromise && (
          <CheckoutProvider
            stripe={stripeCheckoutPromise}
            options={{
              clientSecret,
              elementsOptions: {
                appearance: CHECKOUT_STRIPE_APPEARANCE,
              },
            }}
          >
            <CheckoutPaymentForm
              packageId={UNLOCK_PACKAGE_ID}
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
            packageName={getPackageName(UNLOCK_PACKAGE_ID)}
            priceFormatted={formatCentavosToBrl(
              getPackagePriceCentavos(UNLOCK_PACKAGE_ID)
            )}
            unlockAnalysisId={analysisId}
            onExpiredReturnToPackages={() => onOpenChange(false)}
            onPaymentConfirmed={handlePixPaymentSuccess}
          />
        )}

        {effectiveState === "processing" && <UnlockProcessingView />}

        {effectiveState === "error" && (
          <UnlockErrorView
            errorMessage={errorMessage}
            onClose={() => onOpenChange(false)}
            onRetry={handleRetry}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
