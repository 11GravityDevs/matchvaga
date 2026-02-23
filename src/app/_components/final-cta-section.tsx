import Link from "next/link";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTE_DASHBOARD, ROUTE_LOGIN } from "@/constants/routes";

interface FinalCTASectionProps {
  isLoggedIn?: boolean;
}

export function FinalCTASection({ isLoggedIn = false }: FinalCTASectionProps) {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 bg-linear-to-br from-accent-brand-dark via-accent-brand to-accent-brand-end py-20">
      <div className="mx-auto flex w-full max-w-landing-content flex-col items-center gap-8">
        <h2 className="max-w-cta text-center text-cta-title text-white">
          Pronto para ser chamado
          <br />
          para mais entrevistas?
        </h2>

        <p className="max-w-cta-desc text-center text-lg leading-normal text-white/80">
          Junte-se a mais de 12.000 candidatos que já transformaram sua busca
          por emprego.
        </p>

        <Button
          variant="brand"
          className="gap-2 bg-white px-8 py-6 hover:bg-white/90"
          asChild
        >
          <Link href={isLoggedIn ? ROUTE_DASHBOARD : ROUTE_LOGIN}>
            <Zap className="size-4.5 text-accent-brand" />
            <span className="text-base font-semibold text-accent-brand">
              {isLoggedIn ? "Acessar Dashboard" : "Começar Grátis"}
            </span>
          </Link>
        </Button>

        <p className="text-small text-white/60">
          Sem cartão de crédito &nbsp;&bull;&nbsp; Cancele quando quiser
          &nbsp;&bull;&nbsp; Setup em 30 segundos
        </p>
      </div>
    </section>
  );
}
