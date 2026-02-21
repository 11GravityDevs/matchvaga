"use client";

import { useState } from "react";
import { Download, FileText, RefreshCw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CARD_CONTENT_PADDING,
  CARD_HEADER_PADDING,
  CARD_RADIUS,
  CARD_TITLE_CLASS,
  COLUMN_GAP,
  PAGE_PADDING,
  PAGE_SUBTITLE_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_GAP,
} from "@/constants/design-tokens";
import {
  TEXT_BADGE,
  TEXT_SMALL_LEADING,
  W_COLUMN,
} from "@/constants/design-tokens";
import { useNewAnalysis, WIZARD_STEPS } from "./new-analysis-context";
import { StepIndicator } from "@/components/shared/step-indicator";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

const initialMessages: ChatMessage[] = [
  {
    role: "ai",
    text: "Currículo otimizado com sucesso! O score subiu de 38% para 91%. Posso ajustar o tom, resumir seções ou adicionar mais detalhes.",
  },
  {
    role: "user",
    text: "Deixe o tom mais formal e reduza o resumo profissional.",
  },
  {
    role: "ai",
    text: "Pronto! O resumo foi ajustado para um tom mais formal e conciso. Veja a atualização ao lado.",
  },
];

export function StepPreviewExport() {
  const { jobRole, reset } = useNewAnalysis();
  const [messages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");

  return (
    <div
      className={`flex flex-1 flex-col gap-4 overflow-hidden ${PAGE_PADDING}`}
    >
      {/* Header strip */}
      <div className={`flex flex-1 flex-col ${SECTION_GAP}`}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className={PAGE_TITLE_CLASS}>Currículo Otimizado</h1>
            <p className={PAGE_SUBTITLE_CLASS}>{jobRole}</p>
          </div>
          <StepIndicator steps={WIZARD_STEPS} currentStepIndex={2} />
        </div>

        {/* Two-column body */}
        <div className={`flex min-h-0 flex-1 overflow-hidden ${COLUMN_GAP}`}>
          {/* Left — Document preview */}
          <div
            className={`flex flex-1 flex-col overflow-hidden border border-border bg-card ${CARD_RADIUS}`}
          >
            {/* Doc header */}
            <div
              className={`flex items-center justify-between border-b border-border ${CARD_HEADER_PADDING}`}
            >
              <span className="text-base font-semibold text-foreground">
                Visualização do Currículo
              </span>
              <div className="flex items-center justify-center rounded-full bg-accent-success px-2.5 py-1">
                <span className="text-xs font-semibold text-white">
                  91% Match
                </span>
              </div>
            </div>

            {/* Doc body */}
            <div
              className={`flex flex-1 flex-col gap-4 overflow-auto ${CARD_CONTENT_PADDING}`}
            >
              <div className="flex flex-col gap-1">
                <h2 className={CARD_TITLE_CLASS}>João da Silva</h2>
                <p className="text-sm text-muted-foreground">
                  Desenvolvedor Full-Stack
                </p>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="flex flex-col gap-2">
                <span
                  className={`${TEXT_BADGE} tracking-widest text-muted-foreground uppercase`}
                >
                  RESUMO PROFISSIONAL
                </span>
                <p
                  className={`${TEXT_SMALL_LEADING} leading-relaxed text-foreground`}
                >
                  Desenvolvedor full-stack com 5 anos de experiência em React,
                  Node.js, TypeScript e Next.js. Especializado em design
                  systems, testes automatizados e CI/CD pipelines...
                </p>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="flex flex-col gap-2">
                <span
                  className={`${TEXT_BADGE} tracking-widest text-muted-foreground uppercase`}
                >
                  EXPERIÊNCIA
                </span>
                <p
                  className={`${TEXT_SMALL_LEADING} leading-relaxed text-foreground`}
                >
                  <strong>Senior Developer - TechCorp (2021–2024)</strong>
                  <br />
                  Liderou implementação de design system com React e Next.js.
                  Configurou pipelines de CI/CD e testes automatizados com Jest
                  e Cypress.
                </p>
              </div>
            </div>
          </div>

          {/* Right — Refinement chat */}
          <div
            className={`flex shrink-0 flex-col overflow-hidden border border-border bg-card ${CARD_RADIUS} ${W_COLUMN}`}
          >
            {/* Chat header */}
            <div
              className={`flex flex-col gap-1 border-b border-border ${CARD_HEADER_PADDING}`}
            >
              <span className="text-base font-semibold text-foreground">
                Refinamento
              </span>
              <span className={`${TEXT_SMALL_LEADING} text-muted-foreground`}>
                Ajuste o currículo com instruções
              </span>
            </div>

            {/* Messages */}
            <div
              className={`flex flex-1 flex-col gap-3 overflow-auto ${CARD_CONTENT_PADDING}`}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      msg.role === "ai"
                        ? "flex max-w-[90%] flex-col gap-1 rounded-xl rounded-bl-md bg-muted px-4 py-3"
                        : "flex max-w-[90%] flex-col gap-1 rounded-xl rounded-br-md bg-accent-brand px-4 py-3"
                    }
                  >
                    <span
                      className={
                        msg.role === "ai"
                          ? `${TEXT_BADGE} text-accent-brand`
                          : `${TEXT_BADGE} text-white/70`
                      }
                    >
                      {msg.role === "ai" ? "Assistente" : "Você"}
                    </span>
                    <p
                      className={
                        msg.role === "ai"
                          ? `${TEXT_SMALL_LEADING} leading-relaxed text-foreground`
                          : `${TEXT_SMALL_LEADING} leading-relaxed text-white`
                      }
                    >
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input row */}
            <div className="flex items-center gap-2 px-7 pt-0 pb-7">
              <div className="flex flex-1 items-center rounded-lg border border-input bg-background px-3">
                <Input
                  className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  placeholder="Digite uma instrução..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <Button
                type="button"
                size="icon"
                className="shrink-0 rounded-lg bg-accent-brand hover:bg-accent-brand-hover"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer action row */}
      <div className="flex items-center justify-between border-border">
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={reset}
          className="gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Nova Análise
        </Button>

        <div className="flex items-center gap-3">
          <Button size="brand" variant="outline" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
          <Button size="brand">
            <Download className="h-4 w-4" />
            Download DOCX
          </Button>
        </div>
      </div>
    </div>
  );
}
