"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/utils/style";

import { AnimateOnScroll } from "./animate-on-scroll";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Preciso de experiência técnica para usar o MatchVaga?",
    answer:
      "Não! O MatchVaga foi desenvolvido para ser extremamente simples. Basta fazer upload do seu currículo, colar a vaga desejada e em segundos você recebe tudo pronto.",
  },
  {
    question: "Como funciona a otimização ATS?",
    answer:
      "Nossa IA analisa os requisitos da vaga e identifica as palavras-chave que os sistemas ATS procuram. Em seguida, reorganiza e adapta seu currículo para maximizar a pontuação nos filtros automatizados.",
  },
  {
    question: "Posso cancelar meu plano a qualquer momento?",
    answer:
      "Sim, você pode cancelar a qualquer momento sem taxas adicionais. Seu acesso continuará até o final do período já pago.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Absolutamente. Utilizamos criptografia de ponta a ponta e nunca compartilhamos seus dados com terceiros. Seus documentos são processados de forma segura e você pode deletá-los a qualquer momento.",
  },
  {
    question: "O MatchVaga funciona para vagas internacionais?",
    answer:
      "Sim! O MatchVaga suporta múltiplos idiomas e pode adaptar seu currículo e mensagens para vagas em qualquer país.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="flex w-full flex-col items-center gap-12 bg-background py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4">
          <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            FAQ
          </span>
          <h2 className="text-center text-section-header-large">
            Perguntas frequentes
          </h2>
        </div>
      </AnimateOnScroll>

      {/* FAQ List */}
      <AnimateOnScroll delay={60}>
        <div className="flex w-full max-w-faq flex-col">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            const isLast = i === FAQ_ITEMS.length - 1;

            return (
              <button
                key={item.question}
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full cursor-pointer flex-col py-6 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  !isLast && "border-b border-border"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-base font-medium text-foreground">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-in-out",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
