"use client";

import { CreditCard, QrCode } from "lucide-react";

import { PaymentMethodOption } from "@/app/inicio/checkout/_components/payment-method-option";

interface UnlockPaymentMethodStepProps {
  loadingMethod: "credit-card" | "pix" | null;
  onSelectPix: () => void;
  onSelectCard: () => void;
  packageName: string;
  priceFormatted: string;
}

export function UnlockPaymentMethodStep({
  loadingMethod,
  onSelectPix,
  onSelectCard,
  packageName,
  priceFormatted,
}: UnlockPaymentMethodStepProps) {
  const isLoading = loadingMethod !== null;

  return (
    <div className="flex flex-col gap-6 py-2">
      <p className="text-small text-muted-foreground">
        Compre 1 análise para desbloquear o currículo otimizado. Como deseja
        pagar?
      </p>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <PaymentMethodOption
          title="PIX"
          description="Pagamento instantâneo via QR Code ou copia e cola"
          icon={QrCode}
          loading={loadingMethod === "pix"}
          disabled={isLoading}
          onSelect={onSelectPix}
        />
        <PaymentMethodOption
          title="Cartão"
          description="Parcelamento em até 12x no cartão"
          icon={CreditCard}
          loading={loadingMethod === "credit-card"}
          disabled={isLoading}
          onSelect={onSelectCard}
        />
      </div>
      <p className="text-small text-muted-foreground">
        {packageName} — {priceFormatted}
      </p>
    </div>
  );
}
