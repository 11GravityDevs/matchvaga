"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

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
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const handleResend = useCallback(async () => {
    if (isResending || resendCooldown > 0) return;
    setError(null);
    setIsResending(true);
    try {
      await onResend();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Falha ao reenviar. Tente novamente."
      );
    } finally {
      setIsResending(false);
    }
  }, [isResending, resendCooldown, onResend]);

  const isDisabled = isPending || isResending;
  const isResendDisabled = isResending || isPending || resendCooldown > 0;

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-center text-sm text-destructive">{error}</p>}

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
            className="h-auto cursor-pointer p-0 text-small-semibold text-primary hover:underline disabled:opacity-50"
          >
            {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : "Reenviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
