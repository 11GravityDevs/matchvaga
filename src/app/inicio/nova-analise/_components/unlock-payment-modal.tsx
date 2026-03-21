"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ArrowLeft, CreditCard, QrCode, X } from "lucide-react";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";

import type { UnlockAnalysisResult } from "@/app/actions/document-preview";
import { createCheckoutSession } from "@/app/inicio/checkout/_actions/checkout";
import { createPixCharge } from "@/app/inicio/checkout/_actions/create-pix-charge";
import { CHECKOUT_STRIPE_APPEARANCE } from "@/app/inicio/checkout/_constants/checkout";
import { CheckoutCreditCardForm } from "@/app/inicio/checkout/_components/checkout-credit-card-form";
import { CheckoutPixForm } from "@/app/inicio/checkout/_components/checkout-pix-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import { UnlockPaymentMethodCard } from "./unlock-payment-method-card";
import { UnlockPaymentMethodStep } from "./unlock-payment-method-step";
import { UnlockProcessingView } from "./unlock-processing-view";
import { SharedModalHeader } from "./unlock-shared-modal-header";

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
  onUnlockSuccess: (result: UnlockAnalysisResult) => void;
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
  const [loadingMethod, setLoadingMethod] = useState<
    "credit-card" | "pix" | null
  >(null);

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

  const handleUnlockSuccess = useCallback((result: UnlockAnalysisResult) => {
    setState("success");
    onUnlockSuccessRef.current(result);
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
    setLoadingMethod("credit-card");
    setState("loading");
    const priceCentavos = getPackagePriceCentavos(UNLOCK_PACKAGE_ID);
    trackCheckoutStartedEvent(UNLOCK_PACKAGE_ID, priceCentavos, "credit-card");

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
    if (sessionId) trackCheckoutCompletedEvent(sessionId, "credit-card");
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
        "credit-card"
      );
    }
  }, [initialProcessingFromRedirect]);

  const cannotClose =
    effectiveState === "loading" ||
    effectiveState === "processing" ||
    isPaymentSubmitting;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen && cannotClose) return;
      onOpenChange(newOpen);
    },
    [cannotClose, onOpenChange]
  );

  const handleRetry = useCallback(() => {
    resetState();
  }, [resetState]);

  const packageName = getPackageName(UNLOCK_PACKAGE_ID);
  const priceCentavos = getPackagePriceCentavos(UNLOCK_PACKAGE_ID);
  const priceFormatted = formatCentavosToBrl(priceCentavos);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[520px] gap-0! overflow-hidden p-0!">
        <VisuallyHidden>
          <DialogTitle>Desbloquear currículo</DialogTitle>
        </VisuallyHidden>
        {effectiveState === "method" && (
          <UnlockPaymentMethodStep
            packageName={packageName}
            priceFormatted={priceFormatted}
            onClose={() => onOpenChange(false)}
            paymentMethods={
              <div className="flex gap-3">
                <UnlockPaymentMethodCard
                  variant="pix"
                  title="PIX"
                  description="Pagamento instantâneo via QR Code"
                  icon={<QrCode className="size-6 text-accent-success" />}
                  isLoading={loadingMethod === "pix"}
                  disabled={loadingMethod !== null}
                  onClick={handleSelectPix}
                />
                <UnlockPaymentMethodCard
                  variant="credit-card"
                  title="Cartão"
                  description="Crédito ou débito via Stripe"
                  icon={<CreditCard className="size-6 text-foreground" />}
                  isLoading={loadingMethod === "credit-card"}
                  disabled={loadingMethod !== null}
                  onClick={handleSelectCard}
                />
              </div>
            }
          />
        )}

        {effectiveState === "loading" && (
          <>
            <SharedModalHeader title="Desbloquear currículo" canClose={false} />
            <UnlockLoadingView />
          </>
        )}

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
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setState("method")}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <h2 className="text-lg font-bold text-foreground">
                  Pagamento com Cartão
                </h2>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className={cn(
                    "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors",
                    "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <X className="size-4" />
                </button>
              </DialogClose>
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-5 p-6">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {packageName}
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  ·
                </span>
                <span className="text-base font-bold text-foreground">
                  {priceFormatted}
                </span>
              </div>

              <CheckoutCreditCardForm
                packageId={UNLOCK_PACKAGE_ID}
                onChooseAnotherPackage={() => onOpenChange(false)}
                chooseAnotherLabel="Cancelar"
                onPaymentSuccess={handlePaymentSuccess}
                onSubmittingChange={setIsPaymentSubmitting}
                compact
              />
            </div>
          </CheckoutProvider>
        )}

        {effectiveState === "pix" && pixPayment && (
          <>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setState("method")}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <h2 className="text-lg font-bold text-foreground">
                  Pagamento via PIX
                </h2>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </DialogClose>
            </div>

            <div className="h-px bg-border" />

            <CheckoutPixForm
              paymentId={pixPayment.paymentId}
              brCode={pixPayment.brCode}
              brCodeBase64={pixPayment.brCodeBase64}
              expiresAt={pixPayment.expiresAt}
              packageName={packageName}
              priceFormatted={priceFormatted}
              unlockAnalysisId={analysisId}
              onExpiredReturnToPackages={() => onOpenChange(false)}
              onPaymentConfirmed={handlePixPaymentSuccess}
              compact
            />
          </>
        )}

        {effectiveState === "processing" && (
          <>
            <SharedModalHeader title="Desbloquear currículo" canClose={false} />
            <UnlockProcessingView />
          </>
        )}

        {effectiveState === "error" && (
          <>
            <SharedModalHeader title="Desbloquear currículo" canClose={true} />
            <div className="p-6">
              <UnlockErrorView
                errorMessage={errorMessage}
                onClose={() => onOpenChange(false)}
                onRetry={handleRetry}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
