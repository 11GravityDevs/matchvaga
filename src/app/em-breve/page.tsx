import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

import { LandingFooter } from "../_components/landing-footer";
import { LandingHeader } from "../_components/landing-header";

// TODO(lancamento): remover página /em-breve ou substituir por experiência final
export const metadata: Metadata = {
  title: "MatchVaga - Em construção",
};

export default function EmBrevePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <div className="mx-auto flex w-full max-w-landing-content flex-1 flex-col items-center justify-center px-4 py-16 md:px-0">
        <h1 className="mb-4 text-center text-hero">
          Estamos desenvolvendo essa parte
        </h1>
        <p className="max-w-max-w-section-header mb-8 text-center text-muted-foreground">
          A experiência completa do MatchVaga ainda está em desenvolvimento. Em
          breve você poderá criar sua conta, analisar suas vagas e otimizar seu
          currículo diretamente por aqui.
        </p>
        <Button asChild variant="brand" size="brand">
          <Link href="/">Voltar para a página inicial</Link>
        </Button>
      </div>
      <LandingFooter />
    </main>
  );
}
