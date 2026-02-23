"use client";

import { useSearchParams } from "next/navigation";

import { LoginCheckEmail } from "./login-check-email";
import { LoginEmailForm } from "./login-email-form";
import { LoginFormCard } from "./login-form-card";
import { LoginHero } from "./login-hero";
import { useLogin } from "../_hooks/use-login";

export function LoginContent() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";
  const {
    step,
    setStep,
    isPending,
    email,
    submitEmail,
    resendLink,
    submitGoogle,
  } = useLogin();

  return (
    <>
      <LoginHero />
      {step === "email" ? (
        <LoginFormCard
          title="Seja bem-vindo"
          description="Insira seu email para continuar"
        >
          <LoginEmailForm
            onSubmit={submitEmail}
            onGoogleClick={submitGoogle}
            isPending={isPending}
            initialError={
              authError
                ? "Falha na autenticação com Google. Tente novamente."
                : undefined
            }
          />
        </LoginFormCard>
      ) : (
        <LoginFormCard
          title="Verifique seu email"
          description={`Clique no botão no corpo do email para autenticar automaticamente. Email: ${email}`}
        >
          <LoginCheckEmail
            onResend={resendLink}
            onBack={() => setStep("email")}
            isPending={isPending}
          />
        </LoginFormCard>
      )}
    </>
  );
}
