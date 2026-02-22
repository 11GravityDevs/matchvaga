"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  TEXT_SMALL_LEADING,
  TEXT_SMALL_SEMIBOLD,
} from "@/constants/design-tokens";

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

  const handleResend = useCallback(async () => {
    if (isResending) return;
    setError(null);
    setIsResending(true);
    try {
      await onResend();
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Falha ao reenviar. Tente novamente."
      );
    } finally {
      setIsResending(false);
    }
  }, [isResending, onResend]);

  const isDisabled = isPending || isResending;

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
          <span
            className={`${TEXT_SMALL_LEADING} font-normal text-muted-foreground`}
          >
            Não recebeu o link?
          </span>
          <Button
            type="button"
            variant="link"
            size="default"
            onClick={handleResend}
            disabled={isResending || isPending}
            loading={isResending}
            className={`h-auto cursor-pointer p-0 text-primary hover:underline disabled:opacity-50 ${TEXT_SMALL_SEMIBOLD}`}
          >
            Reenviar
          </Button>
        </div>
      </div>
    </div>
  );
}
