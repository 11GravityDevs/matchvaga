import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="relative flex flex-col items-center gap-8">
        <Logo
          iconContainerClassName="h-14 w-14 rounded-2xl"
          iconClassName="h-7 w-7"
          textClassName="text-3xl text-foreground"
        />

        <div className="relative flex flex-col items-center gap-6">
          <p className="text-[240px] leading-none font-bold tracking-tight text-accent-brand/10">
            404
          </p>

          <div className="absolute top-1/2 flex size-20 -translate-y-1/2 items-center justify-center rounded-2xl border border-border bg-card">
            <SearchX className="size-8 text-accent-brand" />
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Página não encontrada
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            A página que você está procurando não existe ou foi movida para
            outro endereço.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          <Button asChild variant="brand" size="lg">
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
