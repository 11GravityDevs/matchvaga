"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import type { Appearance } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";

import { unlockAnalysis } from "@/app/actions/document-preview";
import { cn } from "@/utils/style";
import { createCheckoutSession } from "@/app/inicio/checkout/_actions/checkout";
import { CheckoutPaymentForm } from "@/app/inicio/checkout/_components/checkout-payment-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QUERY_KEY_ANALYSES,
  QUERY_KEY_CURRENT_USER_DISPLAY,
} from "@/constants/query-keys";
import { trackCheckoutCompletedEvent } from "@/lib/analytics/posthog-events";
import { stripeCheckoutPromise } from "@/lib/stripe/checkout-client";
import { useQueryClient } from "@tanstack/react-query";

const UNLOCK_RETRY_DELAY_MS = 3000;
const UNLOCK_MAX_RETRIES = 5;

const checkoutAppearance: Appearance = {
  theme: "stripe",
  inputs: "spaced",
  labels: "above",
};

interface UnlockPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  onUnlockSuccess: () => void;
  initialProcessingFromRedirect?: { sessionId: string };
}

type ModalState = "loading" | "form" | "processing" | "success" | "error";

export function UnlockPaymentModal({
  open,
  onOpenChange,
  analysisId,
  onUnlockSuccess,
  initialProcessingFromRedirect,
}: UnlockPaymentModalProps) {
  const queryClient = useQueryClient();

  const [state, setState] = useState<ModalState>("loading");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  const attemptRef = useRef(0);
  const hasCreatedSessionRef = useRef(false);
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
    setState("loading");
    setClientSecret(null);
    setSessionId(null);
    setErrorMessage(null);
    setIsPaymentSubmitting(false);
    attemptRef.current = 0;
    hasCreatedSessionRef.current = false;
    hasTrackedRedirectRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => resetState());
      return;
    }

    if (initialProcessingFromRedirect) return;

    if (hasCreatedSessionRef.current || clientSecret) return;

    hasCreatedSessionRef.current = true;

    const createSession = async () => {
      const result = await createCheckoutSession({
        packageId: "avulso",
        analysisId,
        returnToModal: true,
      });

      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret);

        if (result.sessionId) {
          setSessionId(result.sessionId);
        }

        setState("form");
      } else {
        setErrorMessage(
          result.error ?? "Erro ao iniciar checkout. Tente novamente."
        );
        setState("error");
        hasCreatedSessionRef.current = false;
      }
    };

    void createSession();
  }, [
    open,
    analysisId,
    clientSecret,
    initialProcessingFromRedirect,
    resetState,
  ]);

  const handlePaymentSuccess = useCallback(() => {
    setState("processing");
    if (sessionId) trackCheckoutCompletedEvent(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (
      initialProcessingFromRedirect?.sessionId &&
      !hasTrackedRedirectRef.current
    ) {
      hasTrackedRedirectRef.current = true;
      trackCheckoutCompletedEvent(initialProcessingFromRedirect.sessionId);
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
    hasCreatedSessionRef.current = false;
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
            effectiveState === "error"
            ? "max-w-lg"
            : "max-w-3xl"
        )}
      >
        <DialogHeader>
          <DialogTitle>Desbloquear currículo</DialogTitle>
        </DialogHeader>

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
              packageId="avulso"
              onChooseAnotherPackage={() => onOpenChange(false)}
              chooseAnotherLabel="Cancelar"
              onPaymentSuccess={handlePaymentSuccess}
              onSubmittingChange={setIsPaymentSubmitting}
            />
          </CheckoutProvider>
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
