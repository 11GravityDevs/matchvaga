import { AnimateOnScroll } from "./animate-on-scroll";
import { FinalCtaButton } from "./final-cta-button";

export function FinalCTASection() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-6 bg-linear-to-br from-accent-brand-dark via-accent-brand to-accent-brand-end py-12 md:gap-8 md:py-20">
      <AnimateOnScroll intensity="subtle">
        <div className="mx-auto flex w-full max-w-landing-content flex-col items-center gap-6 px-4 md:gap-8 md:px-0">
          <h2 className="max-w-cta text-center text-2xl text-white md:text-cta-title">
            Descubra em minutos o que está impedindo seu currículo
            <br />
            de gerar mais entrevistas
          </h2>

          <p className="max-w-cta-desc text-center text-base leading-normal text-white/80 md:text-lg">
            Compare seu currículo com a vaga, veja os principais gaps e gere uma
            versão mais alinhada antes de se candidatar.
          </p>

          <FinalCtaButton />

          <p className="text-center text-small text-white/60">
            Sem assinatura &nbsp;&bull;&nbsp; Créditos sem expiração
            &nbsp;&bull;&nbsp; Aceitamos PIX e cartão
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
