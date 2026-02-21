"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  TEXT_SMALL_LEADING,
  TEXT_SMALL_SEMIBOLD,
} from "@/constants/design-tokens";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

interface LoginTokenFormProps {
  onSubmit: (token: string) => Promise<void>;
  onResend: () => Promise<void>;
  isPending: boolean;
}

const OTP_LENGTH = 6;

export function LoginTokenForm({
  onSubmit,
  onResend,
  isPending,
}: LoginTokenFormProps) {
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (token.length !== OTP_LENGTH || isSubmitting || isPending) return;

      setError(null);
      setIsSubmitting(true);
      try {
        await onSubmit(token);
      } catch (e) {
        console.error(e);
        setError("Algo deu errado. Tente novamente.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, isSubmitting, isPending, onSubmit]
  );

  const handleResend = useCallback(async () => {
    if (isResending) return;
    setError(null);
    setIsResending(true);
    try {
      await onResend();
    } catch (e) {
      console.error(e);
      setError("Falha ao reenviar. Tente novamente.");
    } finally {
      setIsResending(false);
    }
  }, [isResending, onResend]);

  const isTokenComplete = token.length === OTP_LENGTH;
  const isDisabled = isSubmitting || isPending;
  const isSubmitDisabled = !isTokenComplete || isDisabled;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field orientation="vertical">
        <FieldLabel className="text-sm font-medium text-foreground">
          Código de verificação
        </FieldLabel>
        <FieldContent>
          <InputOTP
            maxLength={OTP_LENGTH}
            value={token}
            onChange={setToken}
            disabled={isDisabled}
            autoFocus
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup className="gap-2 rounded-lg">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-10 w-10 rounded-md"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </FieldContent>
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isSubmitting || isPending}
        className="h-11 w-full"
      >
        Continuar
      </Button>

      <div className="flex items-center justify-center gap-1">
        <span
          className={`${TEXT_SMALL_LEADING} font-normal text-muted-foreground`}
        >
          Não recebeu o código?
        </span>
        <Button
          type="button"
          variant="link"
          size="default"
          onClick={handleResend}
          disabled={isResending || isDisabled}
          loading={isResending}
          className={`h-auto cursor-pointer p-0 text-primary hover:underline disabled:opacity-50 ${TEXT_SMALL_SEMIBOLD}`}
        >
          Reenviar
        </Button>
      </div>
    </form>
  );
}
