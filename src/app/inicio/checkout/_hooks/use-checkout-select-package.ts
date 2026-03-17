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

export interface StripeCheckoutSuccessData {
  paymentMethod: "stripe";
  clientSecret: string;
  packageId: CheckoutPackageId;
}

export interface PixCheckoutSuccessData {
  paymentMethod: "pix";
  packageId: CheckoutPackageId;
  paymentId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt?: string;
}

export type CheckoutSuccessData =
  | StripeCheckoutSuccessData
  | PixCheckoutSuccessData;

export interface UseCheckoutSelectPackageCallbacks {
  onSuccess: (data: CheckoutSuccessData) => void;
  onError: (message: string) => void;
}

const PIX_ERROR_MESSAGE = "Erro ao iniciar checkout PIX. Tente novamente.";
const CHECKOUT_ERROR_MESSAGE = "Erro ao iniciar checkout. Tente novamente.";

type CheckoutResult =
  | { ok: true; data: CheckoutSuccessData }
  | { ok: false; error: string };

async function runPixCheckout(
  packageId: CheckoutPackageId,
  analysisId: string | undefined
): Promise<CheckoutResult> {
  const result = await createPixCharge({
    packageId,
    ...(analysisId && { analysisId }),
  });

  if (
    result.success &&
    result.paymentId &&
    result.brCode &&
    result.brCodeBase64
  ) {
    return {
      ok: true,
      data: {
        paymentMethod: "pix",
        packageId,
        paymentId: result.paymentId,
        brCode: result.brCode,
        brCodeBase64: result.brCodeBase64,
        expiresAt: result.expiresAt,
      },
    };
  }

  return {
    ok: false,
    error: result.error ?? PIX_ERROR_MESSAGE,
  };
}

async function runStripeCheckout(
  packageId: CheckoutPackageId,
  analysisId: string | undefined
): Promise<CheckoutResult> {
  const result = await createCheckoutSession({
    packageId,
    ...(analysisId && { analysisId }),
  });

  if (result.success && result.clientSecret) {
    return {
      ok: true,
      data: {
        paymentMethod: "stripe",
        clientSecret: result.clientSecret,
        packageId,
      },
    };
  }

  return {
    ok: false,
    error: result.error ?? CHECKOUT_ERROR_MESSAGE,
  };
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
        const result =
          paymentMethod === "pix"
            ? await runPixCheckout(id, analysisId)
            : await runStripeCheckout(id, analysisId);

        if (result.ok) {
          onSuccess(result.data);
        } else {
          onError(result.error);
        }
      } catch (error) {
        console.error(
          "[useCheckoutSelectPackage] Unexpected error creating checkout session:",
          error
        );
        onError(CHECKOUT_ERROR_MESSAGE);
      } finally {
        setLoadingPackageId(null);
      }
    },
    [onSuccess, onError]
  );

  return { loadingPackageId, handleSelectPackage };
}
