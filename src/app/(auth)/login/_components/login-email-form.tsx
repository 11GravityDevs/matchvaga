"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/utils/validation";

interface LoginEmailFormProps {
  onSubmit: (email: string, rememberMe?: boolean) => Promise<void>;
  isPending: boolean;
}

export function LoginEmailForm({ onSubmit, isPending }: LoginEmailFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = useMemo(() => isValidEmail(email), [email]);
  const isDisabled = isSubmitting || isPending;
  const isSubmitDisabled = !isEmailValid || isDisabled;

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
        setError("Algo deu errado. Tente novamente.");
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
        <FieldContent>
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

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-normal text-muted-foreground">OU</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" className="h-11 w-full gap-2">
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
