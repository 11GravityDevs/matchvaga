"use client";

import { useState } from "react";
import { File, FileText, Loader2, MoveRight, RefreshCw } from "lucide-react";

import { generateOptimizedDocument } from "@/app/actions/document";
import { Button } from "@/components/ui/button";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";
import { getScoreFeedback } from "../_utils/analysis";
import { StepIndicator } from "@/components/shared/step-indicator";
import { ResumePreviewDocument } from "./resume-preview-document";
import { ScoreRing } from "./score-ring";
import { cn } from "@/utils/style";

const FEEDBACK_BADGE_CLASSES = {
  success:
    "border-accent-success-border bg-accent-success-light text-accent-success-text",
  warning:
    "border-accent-warning-border bg-accent-warning-light text-accent-warning-text",
  low: "border-accent-low-border bg-accent-low-light text-accent-low-text",
} as const;

export function StepPreviewExport() {
  const {
    jobRole,
    resumeData,
    optimizedResumeData,
    analysisId,
    score,
    optimizedScore,
    matchedSkills,
    selectedTechnicalSkills,
    selectedBehavioralSkills,
    reset,
  } = useNewAnalysis();

  const displayResumeData = optimizedResumeData ?? resumeData;

  const [downloadingFormat, setDownloadingFormat] = useState<
    "pdf" | "docx" | null
  >(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload(format: "pdf" | "docx") {
    if (!analysisId || !displayResumeData || downloadingFormat) return;

    setDownloadingFormat(format);
    setDownloadError(null);

    try {
      const result = await generateOptimizedDocument(
        analysisId,
        format,
        displayResumeData
      );

      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        setDownloadError(result.error ?? "Erro ao gerar documento.");
      }
    } catch (error) {
      console.error("[handleDownload] error:", error);
      setDownloadError("Erro inesperado ao gerar documento.");
    } finally {
      setDownloadingFormat(null);
    }
  }

  const initialScore = score ?? 0;
  const finalScore = optimizedScore ?? score ?? 0;
  const hasGain = finalScore > initialScore;
  const gainPoints = hasGain ? finalScore - initialScore : 0;

  const feedback = getScoreFeedback(finalScore);
  const feedbackBadgeClasses = FEEDBACK_BADGE_CLASSES[feedback.variant];

  const skillsPresentCount = matchedSkills.length;
  const skillsAddedCount =
    selectedTechnicalSkills.length + selectedBehavioralSkills.length;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden page-padding">
      {/* Header strip */}
      <div className="flex min-h-0 flex-1 flex-col section-gap">
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-page-title">Currículo Otimizado</h1>
            <p className="text-page-subtitle">{jobRole}</p>
          </div>
          <StepIndicator steps={WIZARD_STEPS} currentStepIndex={2} />
        </div>

        {/* Two-column body */}
        <div className="flex min-h-0 flex-1 column-gap overflow-hidden">
          {/* Left — Document preview (scrollable) */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
            {/* Doc header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border card-header-padding">
              <span className="text-base font-semibold text-foreground">
                Visualização do Currículo
              </span>
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border px-2.5 py-1",
                  feedbackBadgeClasses
                )}
              >
                <span className="text-xs font-semibold">
                  {finalScore}% Match
                </span>
              </div>
            </div>

            {/* Doc body — scrollable */}
            <div className="flex min-h-0 flex-1 flex-col overflow-auto p-16">
              {displayResumeData ? (
                <ResumePreviewDocument data={displayResumeData} />
              ) : (
                <p className="text-small text-muted-foreground">
                  Carregando currículo...
                </p>
              )}
            </div>
          </div>

          {/* Right — Painel de dopamina (Resultado da Otimização) */}
          <div className="flex w-column shrink-0 flex-col self-stretch overflow-hidden rounded-xl border border-border bg-card">
            {/* Panel header — mesmo estilo do header de apresentação de currículo */}
            <div className="flex shrink-0 items-center justify-between border-b border-border card-header-padding">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold text-foreground">
                  Resultado da Otimização
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-5 overflow-hidden card-content-padding">
              {/* Score row: inicial → final + gain badge */}
              <div className="flex items-center justify-between gap-2 self-end">
                {true && (
                  <span className="rounded-lg bg-accent-success px-3 py-2 text-xs font-semibold text-on-accent-success">
                    +{gainPoints}%
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <ScoreRing score={initialScore} size={120} fontSize={28} />
                    <span className="text-small-leading text-muted-foreground">
                      Antes
                    </span>
                  </div>

                  <MoveRight size={40} />

                  <div className="flex flex-1 flex-col items-center gap-1">
                    <ScoreRing score={finalScore} size={120} fontSize={28} />
                    <span className="text-small-leading text-muted-foreground">
                      Depois
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border px-4 py-1.5",
                    feedbackBadgeClasses
                  )}
                >
                  <span className="text-small-semibold">{feedback.label}</span>
                </div>
              </div>

              {/* Skills breakdown (same structure as step-gap-analysis) */}
              <div className="flex flex-col gap-2.5 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-accent-success" />
                    <span className="text-small-leading text-muted-foreground">
                      Habilidades presentes
                    </span>
                  </div>
                  <span className="text-small-semibold font-bold text-foreground">
                    {skillsPresentCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-accent-success" />
                    <span className="text-small-leading text-muted-foreground">
                      Habilidades adicionadas
                    </span>
                  </div>
                  <span className="text-small-semibold font-bold text-accent-success">
                    {skillsAddedCount}
                  </span>
                </div>
              </div>

              {/* Copy block — comentário principal (versão azul consistente com o design) */}
              <div className="rounded-lg bg-accent-brand-light/40 px-4 py-3">
                <p className="text-small-leading leading-relaxed text-blue-800">
                  Você saiu de{" "}
                  <span className="font-semibold">{initialScore}%</span> para{" "}
                  <span className="font-semibold">{finalScore}%</span> de
                  compatibilidade nesta vaga. Continue repetindo esse fluxo em
                  todas as vagas para{" "}
                  <span className="font-semibold">multiplicar</span> suas
                  chances.
                </p>
              </div>
            </div>

            {/* Actions (inside card) */}
            <div className="flex shrink-0 flex-col gap-3 p-6">
              <div className="flex gap-3">
                <Button
                  type="button"
                  size="brand"
                  variant="outline"
                  onClick={reset}
                  className="flex-1 gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  Nova Análise
                </Button>
                <Button
                  size="brand"
                  variant="outline"
                  disabled={!displayResumeData || downloadingFormat !== null}
                  onClick={() => handleDownload("docx")}
                  className="flex-1 gap-1.5"
                >
                  {downloadingFormat === "docx" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Download DOCX
                </Button>
              </div>
              {downloadError && (
                <span className="text-sm text-destructive">
                  {downloadError}
                </span>
              )}
              <Button
                size="brand"
                disabled={!displayResumeData || downloadingFormat !== null}
                onClick={() => handleDownload("pdf")}
                className="w-full gap-1.5"
              >
                {downloadingFormat === "pdf" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <File className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
