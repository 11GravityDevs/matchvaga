import { AnimateOnScroll } from "./animate-on-scroll";
import { FinalCtaButton } from "./final-cta-button";

export function FinalCTASection() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-6 bg-linear-to-br from-accent-brand-dark via-accent-brand to-accent-brand-end py-12 md:gap-8 md:py-20">
      <AnimateOnScroll intensity="subtle">
        <div className="mx-auto flex w-full max-w-landing-content flex-col items-center gap-6 px-4 md:gap-8 md:px-0">
          <h2 className="max-w-cta text-center text-2xl text-white md:text-cta-title">
            Pronto para ser chamado
            <br />
            para mais entrevistas?
          </h2>

          <p className="max-w-cta-desc text-center text-base leading-normal text-white/80 md:text-lg">
            Junte-se a mais de 12.000 candidatos que já transformaram sua busca
            por emprego.
          </p>

          <FinalCtaButton />

          <p className="text-center text-small text-white/60">
            Sem cartão de crédito &nbsp;&bull;&nbsp; Cancele quando quiser
            &nbsp;&bull;&nbsp; Setup em 30 segundos
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
