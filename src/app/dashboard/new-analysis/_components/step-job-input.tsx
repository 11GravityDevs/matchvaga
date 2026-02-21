"use client";

import { Lightbulb, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  CARD_CONTENT_PADDING,
  CARD_RADIUS,
  MAX_W_CONTENT,
  PAGE_PADDING,
  PAGE_SUBTITLE_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_GAP,
  TIP_BANNER_PADDING,
} from "@/constants/design-tokens";
import { TEXT_SMALL_LEADING } from "@/constants/design-tokens";
import { useNewAnalysis, WIZARD_STEPS } from "./new-analysis-context";
import { StepIndicator } from "@/components/shared/step-indicator";

export function StepJobInput() {
  const { jobDescription, setJobDescription, setStep } = useNewAnalysis();

  const canAnalyze = jobDescription.trim().length > 0;

  return (
    <div
      className={`mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden ${MAX_W_CONTENT} ${SECTION_GAP} ${PAGE_PADDING}`}
    >
      {/* Page Header */}
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className={PAGE_TITLE_CLASS}>Nova Análise</h1>
          <p className={PAGE_SUBTITLE_CLASS}>
            Cole a descrição da vaga para analisar a compatibilidade.
          </p>
        </div>
        <StepIndicator steps={WIZARD_STEPS} currentStepIndex={0} />
      </div>

      {/* Job Description Card */}
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden border border-border bg-card ${CARD_RADIUS}`}
      >
        <div
          className={`flex min-h-0 flex-1 flex-col gap-5 overflow-auto ${CARD_CONTENT_PADDING}`}
        >
          <Field className="flex min-h-0 flex-1 flex-col gap-1.5">
            <FieldLabel className="text-base leading-snug font-semibold">
              Descrição da Vaga
            </FieldLabel>
            <FieldDescription>
              Cole aqui o texto completo da vaga que deseja analisar
            </FieldDescription>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-input bg-background">
              <Textarea
                className="h-full min-h-0 resize-none border-0 bg-transparent p-4 text-sm leading-relaxed shadow-none focus-visible:ring-0"
                placeholder="Exemplo: Estamos procurando um desenvolvedor full-stack com experiência em React e Node.js para trabalhar em nosso time de produto..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </Field>

          {/* Tip Banner */}
          <div
            className={`flex items-start gap-2 self-start rounded-lg border border-accent-success-border bg-accent-success-light ${TIP_BANNER_PADDING}`}
          >
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-success" />
            <p className={`${TEXT_SMALL_LEADING} text-accent-success-text`}>
              <span className="font-semibold">Dica:</span> Copie a descrição
              completa da vaga, incluindo requisitos e qualificações para uma
              análise mais precisa.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="brand"
          disabled={!canAnalyze}
          onClick={() => setStep(2)}
          className="gap-1.5"
        >
          <Sparkles className="h-4 w-4" />
          Analisar currículo
        </Button>
      </div>
    </div>
  );
}
