"use client";

import { CreditCard, QrCode } from "lucide-react";

import type { CheckoutPackageId } from "@/constants/checkout-packages";

import type { CheckoutPaymentMethod } from "../_hooks/use-checkout-select-package";
import { PaymentMethodOption } from "./payment-method-option";

export interface CheckoutPaymentMethodSelectorProps {
  paymentMethod: CheckoutPaymentMethod | null;
  loadingPackageId: CheckoutPackageId | null;
  pendingPackageId: CheckoutPackageId;
  onSelectPix: () => void;
  onSelectStripe: () => void;
}

export function CheckoutPaymentMethodSelector({
  paymentMethod,
  loadingPackageId,
  pendingPackageId,
  onSelectPix,
  onSelectStripe,
}: CheckoutPaymentMethodSelectorProps) {
  const isLoading = loadingPackageId !== null;
  const isPixLoading =
    loadingPackageId === pendingPackageId && paymentMethod === "pix";
  const isStripeLoading =
    loadingPackageId === pendingPackageId && paymentMethod === "stripe";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-section-header text-foreground">
        Como deseja pagar?
      </h2>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <PaymentMethodOption
          title="PIX"
          description="Pagamento instantâneo via QR Code ou copia e cola"
          icon={QrCode}
          selected={paymentMethod === "pix"}
          loading={isPixLoading}
          disabled={isLoading}
          onSelect={onSelectPix}
        />
        <PaymentMethodOption
          title="Cartão de crédito"
          description="Parcelamento em até 12x no cartão"
          icon={CreditCard}
          selected={paymentMethod === "stripe"}
          loading={isStripeLoading}
          disabled={isLoading}
          onSelect={onSelectStripe}
        />
      </div>
    </div>
  );
}
