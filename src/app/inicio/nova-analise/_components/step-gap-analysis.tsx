"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Lightbulb, RefreshCw, Sparkles } from "lucide-react";

import { generateResumePreview } from "@/app/actions/document-preview";
import { QUERY_KEY_CURRENT_USER_DISPLAY } from "@/constants/query-keys";
import { currentUserDisplayQueryOptions } from "@/lib/query/query-options";
import { StepIndicator } from "@/components/shared/step-indicator";
import { Button } from "@/components/ui/button";
import {
  GenerateResumeDialogs,
  shouldSkipCreditConsumptionDialog,
} from "./generate-resume-dialogs";
import { Loading } from "@/components/ui/loading";
import { useToastNotification } from "@/hooks/use-toast-notification";
import { cn } from "@/utils/style";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";
import { getScoreFeedback } from "../_utils/analysis";
import { ScoreRing } from "./score-ring";

const GENERATE_RESUME_THINKING_MESSAGES = [
  "Gerando currículo otimizado...",
  "Incorporando habilidades selecionadas...",
  "Ajustando formatação...",
  "Revisando conteúdo...",
  "Quase pronto...",
] as const;

const FEEDBACK_BADGE_CLASSES = {
  success:
    "border-accent-success-border bg-accent-success-light text-accent-success-text",
  warning:
    "border-accent-warning-border bg-accent-warning-light text-accent-warning-text",
  low: "border-accent-low-border bg-accent-low-light text-accent-low-text",
} as const;

function SkillsColumn({
  title,
  description,
  skills,
  selectedCount,
  totalCount,
  onToggleSkill,
}: {
  title: string;
  description: string;
  skills: { id: string; label: string; selected: boolean }[];
  selectedCount: number;
  totalCount: number;
  onToggleSkill: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex shrink-0 justify-between gap-3 card-header-padding pb-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="truncate text-section-header">{title}</h2>
          <p className="text-small-leading text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center self-start rounded-full border border-accent-brand-light bg-accent-brand-light px-3 py-1">
          <span className="text-xs font-semibold whitespace-nowrap text-accent-brand">
            {selectedCount} de {totalCount} selecionadas
          </span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-6 pt-0 scrollbar-hide">
        {skills.map((skill) => (
          <button
            key={skill.id}
            type="button"
            onClick={() => onToggleSkill(skill.id)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors",
              skill.selected
                ? "border-accent-brand-light bg-accent-brand-light"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
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
    </div>
  );
}

export function StepGapAnalysis() {
  const queryClient = useQueryClient();
  const { data: displayData } = useQuery(currentUserDisplayQueryOptions);
  const credits = displayData?.credits ?? 0;

  const {
    jobRole,
    score,
    matchedSkillsCount,
    hardSkills,
    softSkills,
    toggleSkill,
    reset,
    setStep,
    setSelectedHardSkills,
    setSelectedSoftSkills,
    setOptimizedResumeData,
    setOptimizedScore,
    setNeedsUnlock,
    analysisId,
  } = useNewAnalysis();
  const { showErrorToastNotification } = useToastNotification();

  const [isConfirmNoSkillsDialogOpen, setIsConfirmNoSkillsDialogOpen] =
    useState(false);
  const [isConfirmCreditDialogOpen, setIsConfirmCreditDialogOpen] =
    useState(false);

  const selectedHard = hardSkills.filter((s) => s.selected).map((s) => s.label);

  const selectedSoft = softSkills.filter((s) => s.selected).map((s) => s.label);

  const selectedCount =
    hardSkills.filter((s) => s.selected).length +
    softSkills.filter((s) => s.selected).length;

  const totalSkillsCount = hardSkills.length + softSkills.length;

  const { mutate: generateDocument, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      if (!analysisId) throw new Error("Análise não encontrada.");

      const result = await generateResumePreview(
        analysisId,
        selectedHard,
        selectedSoft
      );

      if (!result.success) {
        throw new Error(
          result.error ?? "Erro ao gerar currículo. Tente novamente."
        );
      }

      return result;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
      });
      setSelectedHardSkills(selectedHard);
      setSelectedSoftSkills(selectedSoft);
      if (result.data) {
        setOptimizedResumeData(result.data);
      }
      if (result.optimizedScore != null) {
        setOptimizedScore(result.optimizedScore);
      }
      setNeedsUnlock(result.needsUnlock ?? false);
      setStep(3);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao gerar currículo. Tente novamente.";
      showErrorToastNotification(message);
    },
  });

  const displayScore = score ?? 0;
  const feedback = getScoreFeedback(displayScore);
  const feedbackClasses = FEEDBACK_BADGE_CLASSES[feedback.variant];

  const handleGenerate = () => {
    if (selectedCount === 0) {
      setIsConfirmNoSkillsDialogOpen(true);
      return;
    }
    if (credits > 0 && !shouldSkipCreditConsumptionDialog()) {
      setIsConfirmCreditDialogOpen(true);
      return;
    }
    generateDocument();
  };

  const handleConfirmNoSkills = () => {
    setIsConfirmNoSkillsDialogOpen(false);
    if (credits > 0 && !shouldSkipCreditConsumptionDialog()) {
      setIsConfirmCreditDialogOpen(true);
    } else {
      generateDocument();
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-1 flex-col gap-10 overflow-hidden page-padding">
        <Loading
          thinkingMessages={[...GENERATE_RESUME_THINKING_MESSAGES]}
          className="min-h-0 flex-1"
        />
      </div>
    );
  }

  return (
    <>
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
            {/* Left side — two skill columns + tip */}
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              <div className="flex min-h-0 flex-1 column-gap overflow-hidden">
                <SkillsColumn
                  title="Técnico"
                  description="Selecione as habilidades que deseja incorporar ao currículo"
                  skills={hardSkills}
                  selectedCount={hardSkills.filter((s) => s.selected).length}
                  totalCount={hardSkills.length}
                  onToggleSkill={toggleSkill}
                />
                <SkillsColumn
                  title="Comportamental"
                  description="Selecione as competências que deseja incorporar ao currículo"
                  skills={softSkills}
                  selectedCount={softSkills.filter((s) => s.selected).length}
                  totalCount={softSkills.length}
                  onToggleSkill={toggleSkill}
                />
              </div>
              {/* Tip */}
              <div className="shrink-0 self-start px-0">
                <div className="flex items-start gap-2 rounded-lg border border-accent-success-border bg-accent-success-light tip-banner-padding">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-success" />
                  <p className="text-small-leading text-accent-success-text">
                    <span className="font-semibold">Dica:</span> Selecione
                    apenas habilidades com as quais você já teve contato. Isso
                    garante um currículo mais autêntico.
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
                      {matchedSkillsCount}
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
                      {selectedCount}/{totalSkillsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons — mesma largura/estrutura do card do próximo step */}
              <div className="flex shrink-0 flex-col gap-3 p-6">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    size="brand"
                    variant="outline"
                    onClick={reset}
                    className="flex-1 gap-1.5"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Nova Análise
                  </Button>

                  <Button
                    size="brand"
                    onClick={handleGenerate}
                    disabled={!analysisId || isGenerating}
                    className="flex-1 gap-1.5 rounded-lg bg-accent-brand text-base font-bold hover:bg-accent-brand-hover"
                  >
                    <Sparkles className="h-4 w-4" />
                    Gerar Currículo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GenerateResumeDialogs
          isConfirmNoSkillsDialogOpen={isConfirmNoSkillsDialogOpen}
          onConfirmNoSkillsDialogOpenChange={setIsConfirmNoSkillsDialogOpen}
          isConfirmCreditDialogOpen={isConfirmCreditDialogOpen}
          onConfirmCreditDialogOpenChange={setIsConfirmCreditDialogOpen}
          isGenerating={isGenerating}
          analysisId={analysisId}
          onConfirmNoSkills={handleConfirmNoSkills}
          onConfirmCredit={generateDocument}
        />
      </div>
    </>
  );
}
