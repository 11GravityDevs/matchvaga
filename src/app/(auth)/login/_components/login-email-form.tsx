"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/utils/validation";

interface LoginEmailFormProps {
  onSubmit: (email: string, rememberMe?: boolean) => Promise<void>;
  onGoogleClick: () => Promise<void>;
  isPending: boolean;
  initialError?: string;
}

export function LoginEmailForm({
  onSubmit,
  onGoogleClick,
  isPending,
  initialError,
}: LoginEmailFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  useEffect(() => {
    setError(initialError ?? null);
  }, [initialError]);

  const isEmailValid = useMemo(() => isValidEmail(email), [email]);
  const isDisabled = isSubmitting || isPending || isGoogleLoading;
  const isSubmitDisabled = !isEmailValid || isDisabled;

  const handleGoogleClick = useCallback(async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await onGoogleClick();
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Falha ao conectar com Google."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }, [onGoogleClick]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isEmailValid || isDisabled) return;

      setError(null);
      setIsSubmitting(true);
      try {
        await onSubmit(email.trim());
      } catch (e) {
        console.error(e);
        setError(
          e instanceof Error ? e.message : "Algo deu errado. Tente novamente."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isEmailValid, isDisabled, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field orientation="vertical">
        <FieldLabel className="text-sm font-medium text-foreground">
          E-mail
        </FieldLabel>
        <FieldContent className="flex flex-col gap-1.5">
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isDisabled}
            required
            autoComplete="email"
            autoFocus
            className="h-11 rounded-lg px-3.5"
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </FieldContent>
      </Field>

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isSubmitting || isPending}
        className="h-11 w-full"
      >
        Continuar
      </Button>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-normal text-muted-foreground">OU</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="h-11 w-full gap-2"
        onClick={handleGoogleClick}
        disabled={isDisabled}
        loading={isGoogleLoading}
      >
        <Image
          src="/google-logo.svg"
          alt=""
          width={20}
          height={20}
          className="shrink-0"
          aria-hidden
        />
        Continuar com Google
      </Button>
    </form>
  );
}
