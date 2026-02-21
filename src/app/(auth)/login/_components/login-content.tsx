"use client";

import { LoginEmailForm } from "./login-email-form";
import { LoginFormCard } from "./login-form-card";
import { LoginHero } from "./login-hero";
import { LoginTokenForm } from "./login-token-form";
import { useLogin } from "@/hooks/use-login";

export function LoginContent() {
  const { step, isPending, submitEmail, submitToken, resendToken } = useLogin();

  return (
    <>
      <LoginHero />
      {step === "email" ? (
        <LoginFormCard
          title="Bem-vindo de volta"
          description="Insira seu email para continuar"
        >
          <LoginEmailForm onSubmit={submitEmail} isPending={isPending} />
        </LoginFormCard>
      ) : (
        <LoginFormCard
          title="Verificação de Token"
          description="Insira o código de 6 dígitos enviado ao seu email"
        >
          <LoginTokenForm
            onSubmit={submitToken}
            onResend={resendToken}
            isPending={isPending}
          />
        </LoginFormCard>
      )}
    </>
  );
}
