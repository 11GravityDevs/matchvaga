"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check, Lightbulb, Loader2, Sparkles } from "lucide-react";

import { synthesizeOptimizedResumeForPreview } from "@/app/actions/document";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/style";
import { getScoreFeedback } from "../_utils/analysis";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";
import { ScoreRing } from "./score-ring";
import { StepIndicator } from "@/components/shared/step-indicator";

const FEEDBACK_BADGE_CLASSES = {
  success:
    "border-accent-success-border bg-accent-success-light text-accent-success-text",
  warning:
    "border-accent-warning-border bg-accent-warning-light text-accent-warning-text",
  low: "border-accent-low-border bg-accent-low-light text-accent-low-text",
} as const;

export function StepGapAnalysis() {
  const {
    jobRole,
    score,
    matchedSkills,
    missingSkills,
    toggleSkill,
    setStep,
    setSelectedMissingSkills,
    setOptimizedResumeData,
    analysisId,
  } = useNewAnalysis();

  const {
    mutate: generateDocument,
    isPending: isGenerating,
    error: generateError,
  } = useMutation({
    mutationFn: async () => {
      if (!analysisId) throw new Error("Análise não encontrada.");
      const selected = missingSkills
        .filter((s) => s.selected)
        .map((s) => s.label);
      const result = await synthesizeOptimizedResumeForPreview(
        analysisId,
        selected.length > 0 ? selected : undefined
      );

      if (!result.success) {
        throw new Error(
          result.error ?? "Erro ao gerar currículo. Tente novamente."
        );
      }

      return result;
    },
    onSuccess: (result) => {
      const selected = missingSkills
        .filter((s) => s.selected)
        .map((s) => s.label);
      setSelectedMissingSkills(selected);
      if (result.data) {
        setOptimizedResumeData(result.data);
      }
      setStep(3);
    },
  });

  const selectedCount = missingSkills.filter((s) => s.selected).length;
  const displayScore = score ?? 0;
  const feedback = getScoreFeedback(displayScore);
  const feedbackClasses = FEEDBACK_BADGE_CLASSES[feedback.variant];

  const generateErrorDisplay =
    generateError instanceof Error
      ? generateError.message
      : generateError
        ? String(generateError)
        : null;

  const handleGenerate = () => {
    generateDocument();
  };

  return (
    <div className="flex flex-1 flex-col gap-10 overflow-hidden page-padding">
      {/* Header strip */}
      <div className="flex min-h-0 flex-1 flex-col section-gap">
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-page-title">Análise de Compatibilidade</h1>
            <p className="text-page-subtitle">{jobRole}</p>
          </div>
          <StepIndicator steps={WIZARD_STEPS} currentStepIndex={1} />
        </div>

        {/* Two-column body */}
        <div className="flex min-h-0 flex-1 column-gap overflow-hidden">
          {/* Left column — Skills selection */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
            {/* Card header */}
            <div className="flex shrink-0 items-center justify-between card-header-padding">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-section-header">Habilidades Ausentes</h2>
                <p className="text-small-leading text-muted-foreground">
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

            {/* Skills list — flex-1 min-h-0 so it scrolls when many skills */}
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto card-content-padding">
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
            <div className="shrink-0 self-start px-7 pt-4 pb-7">
              <div className="flex items-start gap-2 rounded-lg border border-accent-success-border bg-accent-success-light tip-banner-padding">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-success" />
                <p className="text-small-leading text-accent-success-text">
                  <span className="font-semibold">Dica:</span> Selecione apenas
                  habilidades com as quais você já teve contato. Isso garante um
                  currículo mais autêntico.
                </p>
              </div>
            </div>
          </div>

          {/* Right column — Score + actions (fixed, non-scrolling) */}
          <div className="flex w-column shrink-0 flex-col self-stretch overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-1 flex-col items-center gap-4 card-content-padding">
              <h2 className="w-full text-section-header tracking-[-0.3px]">
                Score de Compatibilidade
              </h2>

              <ScoreRing score={displayScore} />

              {/* Feedback badge */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border px-4 py-1.5",
                  feedbackClasses
                )}
              >
                <span className="text-small-semibold">{feedback.label}</span>
              </div>

              {/* Hint text */}
              <p className="text-center text-small-leading text-muted-foreground">
                {displayScore >= 75
                  ? "Seu currículo está bem alinhado com a vaga."
                  : displayScore >= 50
                    ? "Seu currículo tem potencial, mas precisa de ajustes nas habilidades técnicas."
                    : "Seu currículo precisa de ajustes significativos para esta vaga."}
              </p>

              {/* Breakdown */}
              <div className="flex w-full flex-col gap-2.5 border-t border-border pt-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-accent-success" />
                    <span className="text-small-leading text-muted-foreground">
                      Habilidades presentes
                    </span>
                  </div>
                  <span className="text-small-semibold font-bold text-foreground">
                    {matchedSkills.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-accent-warning" />
                    <span className="text-small-leading text-muted-foreground">
                      Ausentes selecionadas
                    </span>
                  </div>
                  <span className="text-small-semibold font-bold text-accent-brand">
                    {selectedCount}/{missingSkills.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-small-leading text-muted-foreground">
                      Experiência relevante
                    </span>
                  </div>
                  <span className="text-small-semibold text-accent-warning">
                    Parcial
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons — shared with score column */}
            <div className="flex shrink-0 items-center justify-between card-content-padding py-4">
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-1.5"
                disabled={isGenerating}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              <Button
                size="brand"
                onClick={handleGenerate}
                disabled={!analysisId || isGenerating}
                className="gap-1.5 rounded-lg bg-accent-brand px-7 py-3 text-base font-bold hover:bg-accent-brand-hover"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gerar Currículo Otimizado
              </Button>
            </div>
          </div>
        </div>
      </div>

      {generateErrorDisplay && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {generateErrorDisplay}
        </div>
      )}
    </div>
  );
}
