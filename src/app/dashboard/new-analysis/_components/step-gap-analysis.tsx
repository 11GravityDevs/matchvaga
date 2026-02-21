"use client";

import { ArrowLeft, Check, Lightbulb, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/style";
import { getScoreFeedback } from "@/utils/analysis";
import {
  CARD_CONTENT_PADDING,
  CARD_HEADER_PADDING,
  CARD_RADIUS,
  COLUMN_GAP,
  PAGE_PADDING,
  PAGE_SUBTITLE_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_GAP,
  SECTION_HEADER_CLASS,
  TIP_BANNER_PADDING,
} from "@/constants/design-tokens";
import {
  TEXT_SMALL_LEADING,
  TEXT_SMALL_SEMIBOLD,
  W_COLUMN,
} from "@/constants/design-tokens";
import { useNewAnalysis, WIZARD_STEPS } from "./new-analysis-context";
import { ScoreRing } from "./score-ring";
import { StepIndicator } from "@/components/shared/step-indicator";

const SCORE = 38;

const FEEDBACK_BADGE_CLASSES = {
  success:
    "border-accent-success-border bg-accent-success-light text-accent-success-text",
  warning:
    "border-accent-warning-border bg-accent-warning-light text-accent-warning-text",
  low: "border-accent-low-border bg-accent-low-light text-accent-low-text",
} as const;

export function StepGapAnalysis() {
  const { jobRole, missingSkills, toggleSkill, setStep } = useNewAnalysis();

  const selectedCount = missingSkills.filter((s) => s.selected).length;
  const feedback = getScoreFeedback(SCORE);
  const feedbackClasses = FEEDBACK_BADGE_CLASSES[feedback.variant];

  return (
    <div
      className={`flex flex-1 flex-col gap-4 overflow-hidden ${PAGE_PADDING}`}
    >
      {/* Header strip */}
      <div className={`flex flex-1 flex-col ${SECTION_GAP}`}>
        <div className={`flex items-center justify-between`}>
          <div className="flex flex-col gap-1">
            <h1 className={PAGE_TITLE_CLASS}>Análise de Compatibilidade</h1>
            <p className={PAGE_SUBTITLE_CLASS}>{jobRole}</p>
          </div>
          <StepIndicator steps={WIZARD_STEPS} currentStepIndex={1} />
        </div>

        {/* Two-column body */}
        <div className={`flex min-h-0 flex-1 overflow-hidden ${COLUMN_GAP}`}>
          {/* Left column — Skills selection */}
          <div
            className={`flex flex-1 flex-col overflow-hidden border border-border bg-card ${CARD_RADIUS} shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05),0_2px_6px_-2px_rgba(0,0,0,0.04)]`}
          >
            {/* Card header */}
            <div
              className={`flex items-center justify-between border-b border-border ${CARD_HEADER_PADDING}`}
            >
              <div className="flex flex-col gap-1.5">
                <h2 className={SECTION_HEADER_CLASS}>Habilidades Ausentes</h2>
                <p className={`${TEXT_SMALL_LEADING} text-muted-foreground`}>
                  Selecione as habilidades que deseja incorporar ao currículo
                  otimizado
                </p>
              </div>
              <div className="flex items-center rounded-full border border-accent-brand-light bg-accent-brand-light px-3 py-1">
                <span className="text-xs font-semibold text-accent-brand">
                  {selectedCount} de {missingSkills.length} selecionadas
                </span>
              </div>
            </div>

            {/* Skills list */}
            <div
              className={`flex flex-col gap-2 overflow-auto ${CARD_CONTENT_PADDING}`}
            >
              {missingSkills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    skill.selected
                      ? "border-accent-brand-light bg-accent-brand-light"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      skill.selected
                        ? "border-accent-brand bg-accent-brand"
                        : "border-border bg-background"
                    )}
                  >
                    {skill.selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {skill.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Tip */}
            <div className="self-start px-7 pt-0 pb-7">
              <div
                className={`flex items-start gap-2 rounded-lg border border-accent-success-border bg-accent-success-light ${TIP_BANNER_PADDING}`}
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-success" />
                <p className={`${TEXT_SMALL_LEADING} text-accent-success-text`}>
                  <span className="font-semibold">Dica:</span> Selecione apenas
                  habilidades com as quais você já teve contato. Isso garante um
                  currículo mais autêntico.
                </p>
              </div>
            </div>
          </div>

          {/* Right column — Score */}
          <div
            className={`flex shrink-0 flex-col overflow-hidden border border-border bg-card ${CARD_RADIUS} ${W_COLUMN} shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05),0_2px_6px_-2px_rgba(0,0,0,0.04)]`}
          >
            <div
              className={`flex flex-1 flex-col items-center gap-4 overflow-auto ${CARD_CONTENT_PADDING}`}
            >
              <h2
                className={`w-full ${SECTION_HEADER_CLASS} tracking-[-0.3px]`}
              >
                Score de Compatibilidade
              </h2>

              <ScoreRing score={SCORE} />

              {/* Feedback badge */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border px-4 py-1.5",
                  feedbackClasses
                )}
              >
                <span className={TEXT_SMALL_SEMIBOLD}>{feedback.label}</span>
              </div>

              {/* Hint text */}
              <p
                className={`text-center ${TEXT_SMALL_LEADING} text-muted-foreground`}
              >
                Seu currículo tem potencial, mas precisa de ajustes nas
                habilidades técnicas para esta vaga
              </p>

              {/* Breakdown */}
              <div className="flex w-full flex-col gap-2.5 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-accent-success" />
                    <span
                      className={`${TEXT_SMALL_LEADING} text-muted-foreground`}
                    >
                      Habilidades presentes
                    </span>
                  </div>
                  <span
                    className={`${TEXT_SMALL_SEMIBOLD} font-bold text-foreground`}
                  >
                    4/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-accent-warning" />
                    <span
                      className={`${TEXT_SMALL_LEADING} text-muted-foreground`}
                    >
                      Ausentes selecionadas
                    </span>
                  </div>
                  <span
                    className={`${TEXT_SMALL_SEMIBOLD} font-bold text-accent-brand`}
                  >
                    {selectedCount}/{missingSkills.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span
                      className={`${TEXT_SMALL_LEADING} text-muted-foreground`}
                    >
                      Experiência relevante
                    </span>
                  </div>
                  <span
                    className={`${TEXT_SMALL_SEMIBOLD} text-accent-warning`}
                  >
                    Parcial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer action row */}
      <div className={`flex items-center justify-between border-border`}>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => setStep(1)}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Button
          size="lg"
          onClick={() => setStep(3)}
          className="gap-1.5 rounded-lg bg-accent-brand px-7 py-3 text-base font-bold shadow-(--shadow-accent-brand) hover:bg-accent-brand-hover"
        >
          <Sparkles className="h-4 w-4" />
          Gerar Currículo Otimizado
        </Button>
      </div>
    </div>
  );
}
