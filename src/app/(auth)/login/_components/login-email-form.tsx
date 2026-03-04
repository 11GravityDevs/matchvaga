"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  trackAuthLoginFailedEvent,
  trackLoginEmailSubmittedEvent,
  trackLoginGoogleSubmittedEvent,
} from "@/lib/analytics/posthog-events";
import { mapEmailLoginErrorType } from "../_utils/map-email-login-error-type";
import { mapGoogleLoginErrorType } from "../_utils/map-google-login-error-type";
import { isValidEmail } from "../_utils/validation";

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

  const isEmailValid = isValidEmail(email);
  const isDisabled = isSubmitting || isPending || isGoogleLoading;

  async function handleGoogleClick() {
    setError(null);
    setIsGoogleLoading(true);
    try {
      trackLoginGoogleSubmittedEvent();
      await onGoogleClick();
    } catch (e) {
      console.error(e);
      const message =
        e instanceof Error ? e.message : "Falha ao conectar com Google.";

      const errorType = mapGoogleLoginErrorType(message);
      trackAuthLoginFailedEvent("google", errorType);
      setError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isDisabled) return;

    if (!isEmailValid) {
      setError("Digite um e-mail válido");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      trackLoginEmailSubmittedEvent();
      await onSubmit(email.trim());
    } catch (e) {
      console.error(e);
      const message =
        e instanceof Error ? e.message : "Algo deu errado. Tente novamente.";

      const errorType = mapEmailLoginErrorType(e);
      trackAuthLoginFailedEvent("email", errorType);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field orientation="vertical">
        <FieldLabel className="text-sm font-medium text-foreground">
          E-mail
        </FieldLabel>
        <FieldContent className="flex flex-col gap-1.5">
          <Input
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isDisabled}
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
        disabled={isDisabled}
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
