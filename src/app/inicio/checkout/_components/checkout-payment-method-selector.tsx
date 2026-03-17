"use client";

import { CreditCard, Loader2, QrCode } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CheckoutPackageId } from "@/constants/checkout-packages";
import { cn } from "@/utils/style";

import type { CheckoutPaymentMethod } from "../_hooks/use-checkout-select-package";

interface PaymentMethodOptionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  loading: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function PaymentMethodOption({
  title,
  description,
  icon: Icon,
  selected,
  loading,
  disabled,
  onSelect,
}: PaymentMethodOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border-2 p-6 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        selected
          ? "border-accent-brand bg-accent-brand-light/50 shadow-sm"
          : "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/30"
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-lg",
          selected
            ? "bg-accent-brand text-on-accent-brand"
            : "bg-muted text-muted-foreground"
        )}
      >
        {loading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <Icon className="size-6" />
        )}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-card-title text-foreground">{title}</span>
        <span className="text-small text-muted-foreground">{description}</span>
      </div>
    </button>
  );
}

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
