"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="relative flex flex-col items-center gap-8">
        <Logo
          href="/"
          iconContainerClassName="h-14 w-14 rounded-2xl"
          iconClassName="h-7 w-7"
          textClassName="text-3xl text-foreground"
        />

        <div className="relative flex flex-col items-center gap-6">
          <p className="text-[240px] leading-none font-bold tracking-tight text-destructive/10">
            500
          </p>
        </div>

        <div className="relative flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Algo deu errado
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Ocorreu um erro inesperado.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          <Button variant="brand" size="lg" onClick={reset}>
            Tentar novamente
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
