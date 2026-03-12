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

export interface UseCheckoutSelectPackageCallbacks {
  onSuccess: (data: {
    clientSecret: string;
    packageId: CheckoutPackageId;
  }) => void;
  onError: (message: string) => void;
}

export function useCheckoutSelectPackage({
  onSuccess,
  onError,
}: UseCheckoutSelectPackageCallbacks) {
  const [loadingPackageId, setLoadingPackageId] =
    useState<CheckoutPackageId | null>(null);

  const handleSelectPackage = useCallback(
    async (id: CheckoutPackageId) => {
      const credits = getCreditsForPackage(id);
      const priceCentavos = getPackagePriceCentavos(id);

      trackPricingPackageSelectedEvent(id, credits, priceCentavos);
      trackCheckoutStartedEvent(id, priceCentavos);

      setLoadingPackageId(id);

      try {
        const result = await createCheckoutSession({ packageId: id });

        if (result.success && result.clientSecret) {
          onSuccess({ clientSecret: result.clientSecret, packageId: id });
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
