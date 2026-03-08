"use client";

import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Card, CardContent } from "@/components/ui/card";

export function LoginMobileInfo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-8 py-8">
      <div className="flex w-full max-w-login-form flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <Logo
            iconContainerClassName="h-12 w-12 rounded-xl"
            iconClassName="h-6 w-6"
            textClassName="text-2xl font-bold tracking-[-0.5px]"
          />
          <span className="text-sm font-normal text-muted-foreground">
            Otimização Inteligente de Currículos
          </span>
        </div>

        <Card className="w-full rounded-xl border border-border">
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <h1 className="text-lg font-bold text-foreground">
              Use o MatchVaga em uma tela maior
            </h1>
            <p>
              Para ter a melhor experiência de análise e otimização de
              currículos, acesse o MatchVaga pelo computador.
            </p>

            <p>
              No computador, você acompanha suas análises, compara seu currículo
              com vagas específicas e gera currículos otimizados com muito mais
              conforto de leitura.
            </p>

            <p>
              Para continuar, abra este mesmo endereço no navegador do seu
              notebook ou desktop e faça login normalmente para acessar seu
              painel.
            </p>
          </CardContent>
        </Card>

        <p className="max-w-hero-desc text-center text-xs font-normal text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <Link
            href="/termos-de-servico"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
          >
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link
            href="/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
