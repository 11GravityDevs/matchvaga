"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (token.length !== OTP_LENGTH || isSubmitting || isPending) return;

      setIsSubmitting(true);
      try {
        await onSubmit(token);
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, isSubmitting, isPending, onSubmit]
  );

  const handleResend = useCallback(async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      await onResend();
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

      <Button type="submit" disabled={isSubmitDisabled} className="h-11 w-full">
        Continuar
      </Button>

      <div className="flex items-center justify-center gap-1">
        <span className="text-[13px] font-normal text-muted-foreground">
          Não recebeu o código?
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || isDisabled}
          className="cursor-pointer text-[13px] font-semibold text-primary hover:underline disabled:opacity-50"
        >
          Reenviar
        </button>
      </div>
    </form>
  );
}
