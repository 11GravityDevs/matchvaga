"use client";

import { useCallback, useState } from "react";

import type { CheckoutPackageId } from "@/constants/checkout-packages";
import {
  getCreditsForPackage,
  getPackagePriceCentavos,
} from "@/constants/checkout-packages";
import {
  trackCheckoutStartedEvent,
  trackPricingPackageSelectedEvent,
} from "@/lib/analytics/posthog-events";

import { createCheckoutSession } from "../_actions/checkout";
import { createPixCharge } from "../_actions/create-pix-charge";

export type CheckoutPaymentMethod = "stripe" | "pix";

export interface UseCheckoutSelectPackageCallbacks {
  onSuccess: (
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
  ) => void;
  onError: (message: string) => void;
}

export function useCheckoutSelectPackage({
  onSuccess,
  onError,
}: UseCheckoutSelectPackageCallbacks) {
  const [loadingPackageId, setLoadingPackageId] =
    useState<CheckoutPackageId | null>(null);

  const handleSelectPackage = useCallback(
    async (
      id: CheckoutPackageId,
      analysisId?: string,
      paymentMethod: CheckoutPaymentMethod = "stripe"
    ) => {
      const credits = getCreditsForPackage(id);
      const priceCentavos = getPackagePriceCentavos(id);

      trackPricingPackageSelectedEvent(id, credits, priceCentavos);
      trackCheckoutStartedEvent(id, priceCentavos, paymentMethod);

      setLoadingPackageId(id);

      try {
        if (paymentMethod === "pix") {
          const result = await createPixCharge({
            packageId: id,
            ...(analysisId && { analysisId }),
          });

          if (
            result.success &&
            result.paymentId &&
            result.brCode &&
            result.brCodeBase64
          ) {
            onSuccess({
              paymentMethod: "pix",
              packageId: id,
              paymentId: result.paymentId,
              brCode: result.brCode,
              brCodeBase64: result.brCodeBase64,
              expiresAt: result.expiresAt,
            });
            setLoadingPackageId(null);
            return;
          }

          setLoadingPackageId(null);
          onError(
            result.error ?? "Erro ao iniciar checkout PIX. Tente novamente."
          );
          return;
        }

        const result = await createCheckoutSession({
          packageId: id,
          ...(analysisId && { analysisId }),
        });

        if (result.success && result.clientSecret) {
          onSuccess({
            paymentMethod: "stripe",
            clientSecret: result.clientSecret,
            packageId: id,
          });
          setLoadingPackageId(null);
          return;
        }

        setLoadingPackageId(null);
        onError(result.error ?? "Erro ao iniciar checkout. Tente novamente.");
      } catch (error) {
        console.error(
          "[useCheckoutSelectPackage] Unexpected error creating checkout session:",
          error
        );
        setLoadingPackageId(null);
        onError("Erro ao iniciar checkout. Tente novamente.");
      }
    },
    [onSuccess, onError]
  );

  return { loadingPackageId, handleSelectPackage };
}
