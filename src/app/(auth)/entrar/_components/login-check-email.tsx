"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useToastNotification } from "@/hooks/useToastNotification";

const RESEND_COOLDOWN_SECONDS = 60;

interface LoginCheckEmailProps {
  onResend: () => Promise<void>;
  onBack: () => void;
  isPending: boolean;
}

export function LoginCheckEmail({
  onResend,
  onBack,
  isPending,
}: LoginCheckEmailProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const { showErrorToastNotification } = useToastNotification();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  async function handleResend() {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      await onResend();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      console.error(e);
      const message =
        e instanceof Error ? e.message : "Falha ao reenviar. Tente novamente.";
      showErrorToastNotification(message);
    } finally {
      setIsResending(false);
    }
  }

  const isDisabled = isPending || isResending;
  const isResendDisabled = isResending || isPending || resendCooldown > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={onBack}
          disabled={isDisabled}
        >
          Usar outro email
        </Button>

        <div className="flex items-center justify-center gap-1">
          <span className="text-small-leading font-normal text-muted-foreground">
            Não recebeu o link?
          </span>
          <Button
            type="button"
            variant="link"
            size="default"
            onClick={handleResend}
            disabled={isResendDisabled}
            loading={isResending}
            className="h-auto p-0 text-small-semibold text-primary hover:underline disabled:opacity-50"
          >
            {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : "Reenviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
