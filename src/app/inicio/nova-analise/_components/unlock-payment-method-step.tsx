"use client";

import type { ReactNode } from "react";

import { ShieldCheck, X } from "lucide-react";

import { DialogClose } from "@/components/ui/dialog";

interface UnlockPaymentMethodStepProps {
  packageName: string;
  priceFormatted: string;
  onClose: () => void;
  paymentMethods: ReactNode;
}

export function UnlockPaymentMethodStep({
  packageName,
  priceFormatted,
  onClose,
  paymentMethods,
}: UnlockPaymentMethodStepProps) {
  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            Desbloquear currículo
          </h2>
          <p className="max-w-[360px] text-sm text-muted-foreground">
            Escolha a forma de pagamento para desbloquear seu currículo
            otimizado.
          </p>
        </div>
        <DialogClose asChild onClick={onClose}>
          <button
            type="button"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>

      {/* Price badge */}
      <div className="flex items-center justify-center rounded-lg bg-secondary px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground">
          {packageName} — {priceFormatted}
        </span>
      </div>

      {paymentMethods}

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5">
        <ShieldCheck className="size-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Pagamento seguro e criptografado
        </span>
      </div>
    </div>
  );
}
