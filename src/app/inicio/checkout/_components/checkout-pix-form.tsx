"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Copy, QrCode } from "lucide-react";

import { getPixPaymentStatus } from "@/app/inicio/checkout/_actions/get-pix-payment-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTE_HOME_CHECKOUT_SUCCESS } from "@/constants/routes";

import { useToastNotification } from "@/hooks/use-toast-notification";
import { CHECKOUT_PIX_JUST_PAID_KEY } from "../_constants/checkout";

interface CheckoutPixFormProps {
  paymentId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt?: string;
  packageName: string;
  priceFormatted: string;
  unlockAnalysisId?: string;
  onRequestNewPayment?: () => void;
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
  onRequestNewPayment,
}: CheckoutPixFormProps) {
  const [statusMessage, setStatusMessage] = useState<string>(
    "Aguardando confirmação do pagamento..."
  );
  const [copyButtonLabel, setCopyButtonLabel] = useState("Copiar código");
  const [canRequestNewPayment, setCanRequestNewPayment] = useState(false);
  const { showErrorToastNotification, showSuccessToastNotification } =
    useToastNotification();
  const router = useRouter();

  const expiresAtLabel = useMemo(() => {
    if (!expiresAt) return undefined;
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toLocaleTimeString("pt-BR");
  }, [expiresAt]);

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
        setStatusMessage(
          "PIX expirado. Gere um novo pagamento para continuar."
        );
        setCanRequestNewPayment(true);
        return;
      }

      if (result.status === "cancelled") {
        setStatusMessage(
          "Pagamento cancelado. Gere um novo PIX para continuar."
        );
        setCanRequestNewPayment(true);
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
  }, [paymentId, router, unlockAnalysisId]);

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(brCode);
      setCopyButtonLabel("Código copiado");
      showSuccessToastNotification("Código PIX copiado.");
    } catch {
      showErrorToastNotification("Não foi possível copiar o código PIX.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Card superior igual ao do cartão */}
      <Card className="w-full border border-border">
        <CardContent className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Finalizar compra do pacote</CardTitle>
            <span className="text-base font-semibold text-accent-brand">
              {packageName}
            </span>
          </div>
          <span className="text-xl font-bold">{priceFormatted}</span>
        </CardContent>
      </Card>

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
          {expiresAtLabel ? (
            <span className="text-caption-leading text-muted-foreground">
              Expira às {expiresAtLabel}
            </span>
          ) : null}
        </div>

        {canRequestNewPayment && onRequestNewPayment ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="brand"
              onClick={onRequestNewPayment}
            >
              Gerar novo PIX
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
