"use client";

import { useEffect, useState } from "react";

import type { CheckoutPackageId } from "@/constants/checkout-packages";

import { CHECKOUT_PIX_JUST_PAID_KEY } from "../_constants/checkout";

export interface CheckoutPixPayment {
  paymentId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt?: string;
}

export interface UseCheckoutEffectiveStateParams {
  pixPayment: CheckoutPixPayment | null;
  checkoutClientSecret: string | null;
  pendingPackageId: CheckoutPackageId | null;
  selectedPackageId: CheckoutPackageId | null;
  onChooseAnotherPackage: () => void;
}

function getResetFromPixJustPaid(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!sessionStorage.getItem(CHECKOUT_PIX_JUST_PAID_KEY);
  } catch {
    return false;
  }
}

export function useCheckoutEffectiveState({
  pixPayment,
  checkoutClientSecret,
  pendingPackageId,
  selectedPackageId,
  onChooseAnotherPackage,
}: UseCheckoutEffectiveStateParams) {
  const [resetFromSuccess] = useState(() => getResetFromPixJustPaid());

  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        sessionStorage.getItem(CHECKOUT_PIX_JUST_PAID_KEY)
      ) {
        sessionStorage.removeItem(CHECKOUT_PIX_JUST_PAID_KEY);
        queueMicrotask(onChooseAnotherPackage);
      }
    } catch {}
  }, [onChooseAnotherPackage]);

  return {
    effectivePixPayment: resetFromSuccess ? null : pixPayment,
    effectiveCheckoutClientSecret: resetFromSuccess
      ? null
      : checkoutClientSecret,
    effectivePendingPackageId: resetFromSuccess ? null : pendingPackageId,
    effectiveSelectedPackageId: resetFromSuccess ? null : selectedPackageId,
  };
}
