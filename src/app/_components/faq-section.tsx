"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/utils/style";

import { FAQ_ITEMS } from "../_constants/faq";
import { AnimateOnScroll } from "./animate-on-scroll";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="flex w-full flex-col items-center gap-8 bg-background py-12 md:scroll-mt-12 md:gap-12 md:py-20"
    >
      {/* Section Header */}
      <AnimateOnScroll>
        <div className="flex max-w-section-header flex-col items-center gap-4 px-4 md:px-0">
          <span className="rounded-full border border-accent-brand px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
            FAQ
          </span>
          <h2 className="text-center text-section-header-large">
            Perguntas frequentes
          </h2>
          <p className="max-w-section-desc text-center text-base leading-normal text-muted-foreground">
            Tudo o que você precisa saber sobre funcionamento, análises,
            segurança e resultados antes de começar.
          </p>
        </div>
      </AnimateOnScroll>

      {/* FAQ List */}
      <AnimateOnScroll delay={60}>
        <div className="flex w-full max-w-faq flex-col px-4 md:px-0">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            const isLast = i === FAQ_ITEMS.length - 1;
            const answerId = `faq-answer-${i}`;

            return (
              <div
                key={item.question}
                className={!isLast ? "border-b border-border" : undefined}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-question-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-start py-6 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  >
                    <span className="flex w-full items-center justify-between">
                      <span className="text-base font-medium text-foreground">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-in-out",
                          isOpen && "rotate-180"
                        )}
                        aria-hidden
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  aria-hidden={!isOpen}
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                      {item.linkHref && item.linkLabel ? (
                        <>
                          {" "}
                          <Link
                            href={item.linkHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-accent-brand underline underline-offset-4 transition-colors hover:text-accent-brand-hover"
                          >
                            {item.linkLabel}
                          </Link>
                          .
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
