"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Copy, QrCode, ShieldCheck, Timer } from "lucide-react";

import { getPixPaymentStatus } from "@/app/inicio/checkout/_actions/get-pix-payment-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTE_HOME_CHECKOUT_SUCCESS } from "@/constants/routes";

import { useToastNotification } from "@/hooks/use-toast-notification";
import { CHECKOUT_PIX_JUST_PAID_KEY } from "../_constants/checkout";
import { CheckoutPackageSummaryCard } from "./checkout-package-summary-card";

interface CheckoutPixFormProps {
  paymentId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt?: string;
  packageName: string;
  priceFormatted: string;

  unlockAnalysisId?: string;
  onExpiredReturnToPackages?: () => void;
  onPaymentConfirmed?: () => void;
  compact?: boolean;
}

const PIX_STATUS_POLLING_MS = 5000;

export function CheckoutPixForm({
  paymentId,
  brCode,
  brCodeBase64,
  expiresAt,
  packageName,
  priceFormatted,
  unlockAnalysisId,
  onExpiredReturnToPackages,
  onPaymentConfirmed,
  compact = false,
}: CheckoutPixFormProps) {
  const [statusMessage, setStatusMessage] = useState<string>(
    "Aguardando confirmação do pagamento..."
  );
  const [copyButtonLabel, setCopyButtonLabel] = useState("Copiar código");
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showErrorToastNotification, showSuccessToastNotification } =
    useToastNotification();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const expiresAtDate = new Date(expiresAt);
    if (Number.isNaN(expiresAtDate.getTime())) return;

    const update = () => {
      const diff = Math.max(
        0,
        Math.floor((expiresAtDate.getTime() - Date.now()) / 1000)
      );
      setTimeLeft(diff);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const countdownLabel = useMemo(() => {
    if (timeLeft === null) return null;
    if (timeLeft <= 0) return "Expirado";
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [timeLeft]);

  useEffect(() => {
    let cancelled = false;
    let failureCount = 0;

    const checkStatus = async () => {
      const result = await getPixPaymentStatus({ paymentId });

      if (cancelled) return;

      if (!result.success || !result.status) {
        failureCount += 1;
        if (failureCount === 1) {
          setStatusMessage(
            "Não foi possível verificar o status do pagamento. Vamos tentar novamente em alguns instantes."
          );
        }
        return;
      }

      if (result.status === "paid") {
        if (onPaymentConfirmed) {
          onPaymentConfirmed();
          return;
        }

        setStatusMessage("Pagamento confirmado. Redirecionando...");
        try {
          sessionStorage.setItem(CHECKOUT_PIX_JUST_PAID_KEY, "1");
        } catch {}
        const successUrl = unlockAnalysisId
          ? `${ROUTE_HOME_CHECKOUT_SUCCESS}?payment_id=${paymentId}&unlock=${unlockAnalysisId}`
          : `${ROUTE_HOME_CHECKOUT_SUCCESS}?payment_id=${paymentId}`;

        router.push(successUrl);

        return;
      }

      if (result.status === "expired") {
        if (onExpiredReturnToPackages) {
          onExpiredReturnToPackages();
          return;
        }
        setStatusMessage(
          "PIX expirado. Gere um novo pagamento para continuar."
        );
        return;
      }

      if (result.status === "cancelled") {
        if (onExpiredReturnToPackages) {
          onExpiredReturnToPackages();
          return;
        }
        setStatusMessage(
          "Pagamento cancelado. Gere um novo PIX para continuar."
        );
        return;
      }
    };

    const intervalId = setInterval(() => {
      void checkStatus();
    }, PIX_STATUS_POLLING_MS);

    void checkStatus();

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [
    paymentId,
    router,
    unlockAnalysisId,
    onExpiredReturnToPackages,
    onPaymentConfirmed,
  ]);

  const handleCopyPixCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(brCode);
      setCopyButtonLabel("Copiado!");
      showSuccessToastNotification("Código PIX copiado.");

      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = setTimeout(
        () => setCopyButtonLabel("Copiar código"),
        2000
      );
    } catch {
      showErrorToastNotification("Não foi possível copiar o código PIX.");
    }
  }, [brCode, showSuccessToastNotification, showErrorToastNotification]);

  if (compact) {
    return (
      <div className="flex flex-col">
        {/* QR section */}
        <div className="flex flex-col items-center gap-4 px-4 py-6">
          <p className="text-sm font-medium text-muted-foreground">
            Escaneie o QR Code com o app do seu banco
          </p>
          <div className="flex size-[200px] items-center justify-center rounded-xl border border-border bg-background p-3">
            <Image
              src={brCodeBase64}
              alt="QR Code PIX"
              width={176}
              height={176}
              className="size-44 rounded object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3 px-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">
            ou copie o código
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Copy row */}
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="flex min-h-12 min-w-0 flex-1 items-center rounded-lg border border-border bg-background px-3.5 py-2.5">
            <p className="truncate font-mono text-xs text-muted-foreground">
              {brCode}
            </p>
          </div>
          <Button
            type="button"
            variant="brand"
            size="brand"
            onClick={handleCopyPixCode}
            className="min-w-42 shrink-0 gap-1.5"
          >
            <Copy className="size-3.5" />
            {copyButtonLabel}
          </Button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-[#16A34A]" />
            <span className="text-sm font-medium text-muted-foreground">
              {statusMessage}
            </span>
          </div>
          {countdownLabel && (
            <div className="flex items-center gap-1.5">
              <Timer className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Expira em {countdownLabel}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
              Pagamento seguro e criptografado
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <CheckoutPackageSummaryCard
        packageName={packageName}
        priceFormatted={priceFormatted}
      />

      <Card className="w-full overflow-hidden card-base border border-border">
        <CardHeader>
          <CardTitle>Pagamento via PIX</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-8 card-content-padding">
          {/* QR Code — scan zone */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-small-medium text-foreground">
              Escaneie o QR Code no app do seu banco
            </p>
            <Image
              src={brCodeBase64}
              alt="QR Code PIX"
              width={240}
              height={240}
              className="size-60 object-contain"
              unoptimized
            />
          </div>

          {/* Copia e cola */}
          <div className="flex flex-col gap-3">
            <p className="text-form-label text-muted-foreground">
              Ou use o código Copia e Cola
            </p>
            <div className="relative min-h-12 w-full overflow-hidden rounded-xl border border-border bg-muted/60 pr-12">
              <div className="overflow-auto px-4 py-3 font-mono text-small leading-relaxed tracking-tight break-all text-foreground">
                {brCode}
              </div>
              <button
                type="button"
                onClick={handleCopyPixCode}
                className="absolute top-2 right-2 flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={copyButtonLabel}
                title={copyButtonLabel}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status — positive, visible */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/60 tip-banner-padding">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-2 text-small font-medium text-foreground">
            <QrCode className="size-4 shrink-0 text-muted-foreground" />
            {statusMessage}
          </span>
          {countdownLabel ? (
            <span className="text-caption-leading text-muted-foreground">
              Expira em {countdownLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
