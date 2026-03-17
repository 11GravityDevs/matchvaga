"use client";

import { CreditCard, Loader2, QrCode } from "lucide-react";

import { cn } from "@/utils/style";

const methodButtonClass =
  "flex flex-col items-start gap-3 rounded-xl border-2 p-6 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";
const methodButtonActive =
  "border-accent-brand bg-accent-brand-light/50 shadow-sm";
const methodButtonInactive =
  "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/30";
const methodIconBox = "flex size-12 items-center justify-center rounded-lg";
const methodIconActive = "bg-accent-brand text-on-accent-brand";
const methodIconInactive = "bg-muted text-muted-foreground";

interface UnlockPaymentMethodStepProps {
  loadingMethod: "stripe" | "pix" | null;
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
  return (
    <div className="flex flex-col gap-6 py-2">
      <p className="text-small text-muted-foreground">
        Compre 1 análise para desbloquear o currículo otimizado. Como deseja
        pagar?
      </p>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void onSelectPix()}
          disabled={loadingMethod !== null}
          className={cn(
            methodButtonClass,
            loadingMethod === "pix" ? methodButtonActive : methodButtonInactive
          )}
          aria-pressed={loadingMethod === "pix"}
        >
          <span
            className={cn(
              methodIconBox,
              loadingMethod === "pix" ? methodIconActive : methodIconInactive
            )}
          >
            {loadingMethod === "pix" ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <QrCode className="size-6" />
            )}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-card-title text-foreground">PIX</span>
            <span className="text-small text-muted-foreground">
              Pagamento instantâneo via QR Code ou copia e cola
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => void onSelectCard()}
          disabled={loadingMethod !== null}
          className={cn(
            methodButtonClass,
            loadingMethod === "stripe"
              ? methodButtonActive
              : methodButtonInactive
          )}
          aria-pressed={loadingMethod === "stripe"}
        >
          <span
            className={cn(
              methodIconBox,
              loadingMethod === "stripe" ? methodIconActive : methodIconInactive
            )}
          >
            {loadingMethod === "stripe" ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <CreditCard className="size-6" />
            )}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-card-title text-foreground">Cartão</span>
            <span className="text-small text-muted-foreground">
              Parcelamento em até 12x no cartão
            </span>
          </div>
        </button>
      </div>
      <p className="text-small text-muted-foreground">
        {packageName} — {priceFormatted}
      </p>
    </div>
  );
}
