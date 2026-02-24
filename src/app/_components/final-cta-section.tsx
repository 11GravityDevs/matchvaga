import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AnimateOnScroll } from "./animate-on-scroll";
import { AuthAwareLink } from "./auth-aware-link";

export function FinalCTASection() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 bg-linear-to-br from-accent-brand-dark via-accent-brand to-accent-brand-end py-20">
      <AnimateOnScroll intensity="subtle">
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
            <AuthAwareLink
              loggedOutLabel="Começar Grátis"
              loggedInLabel="Acessar Dashboard"
              icon={<Zap className="size-4.5 text-accent-brand" />}
              className="flex items-center gap-2"
              labelClassName="text-base font-semibold text-accent-brand"
            />
          </Button>

          <p className="text-small text-white/60">
            Sem cartão de crédito &nbsp;&bull;&nbsp; Cancele quando quiser
            &nbsp;&bull;&nbsp; Setup em 30 segundos
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
