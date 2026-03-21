"use client";

import type { ReactNode } from "react";

import { cn } from "@/utils/style";

export type UnlockPaymentMethodCardVariant = "pix" | "credit-card";

interface UnlockPaymentMethodCardProps {
  title: string;
  description: string;
  variant: UnlockPaymentMethodCardVariant;
  icon: ReactNode;
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}

const VARIANT_STYLES = {
  pix: {
    iconWrap: "bg-accent-success-light",
    spinner: "border-accent-success border-t-transparent",
  },
  "credit-card": {
    iconWrap: "bg-secondary",
    spinner: "border-foreground border-t-transparent",
  },
} as const;

export function UnlockPaymentMethodCard({
  title,
  description,
  variant,
  icon,
  isLoading,
  disabled,
  onClick,
}: UnlockPaymentMethodCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 cursor-pointer flex-col items-center gap-3 rounded-xl p-5 text-center transition-all",
        "hover:border-accent-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "relative border-2 border-border"
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          styles.iconWrap
        )}
      >
        {isLoading ? (
          <div
            className={cn(
              "size-6 animate-spin rounded-full border-2 border-t-transparent",
              styles.spinner
            )}
          />
        ) : (
          icon
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </button>
  );
}
