import {
  File,
  FileText,
  Loader2,
  Lock,
  MoveRight,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/style";
import { ScoreRing } from "./score-ring";

interface StepPreviewOptimizationPanelProps {
  finalScore: number;
  initialScore: number;
  hasGain: boolean;
  isScoreEqual: boolean;
  gainPoints: number;
  feedbackBadgeClasses: string;
  feedbackLabel: string;
  skillsPresentCount: number;
  skillsAddedCount: number;
  isAnalysisUnlocked: boolean;
  analysisId: string | null;
  displayResumeData: unknown;
  downloadingFormat: "pdf" | "docx" | null;
  downloadError: string | null;
  isUnlocking: boolean;
  onReset: () => void;
  onDownload: (format: "pdf" | "docx") => void;
  onUnlockClick: () => void;
}

export function StepPreviewOptimizationPanel({
  finalScore,
  initialScore,
  hasGain,
  isScoreEqual,
  gainPoints,
  feedbackBadgeClasses,
  feedbackLabel,
  skillsPresentCount,
  skillsAddedCount,
  isAnalysisUnlocked,
  analysisId,
  displayResumeData,
  downloadingFormat,
  downloadError,
  isUnlocking,
  onReset,
  onDownload,
  onUnlockClick,
}: StepPreviewOptimizationPanelProps) {
  return (
    <div className="flex w-column shrink-0 flex-col self-stretch overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border card-header-padding">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-foreground">
            Resultado da Otimização
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-hidden card-content-padding">
        <div className="flex items-center justify-between gap-2 self-end">
          {hasGain && (
            <span className="rounded-lg bg-accent-success px-3 py-2 text-xs font-semibold text-on-accent-success">
              +{gainPoints}%
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center justify-between gap-4">
            {isScoreEqual ? (
              <div className="flex flex-1 flex-col items-center gap-1">
                <ScoreRing score={finalScore} size={140} fontSize={36} />
                <span className="text-small-leading text-muted-foreground">
                  Compatibilidade
                </span>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
          {!isScoreEqual && (
            <div
              className={cn(
                "flex items-center justify-center rounded-full border px-4 py-1.5",
                feedbackBadgeClasses
              )}
            >
              <span className="text-small-semibold">{feedbackLabel}</span>
            </div>
          )}
        </div>

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
          {!isScoreEqual && (
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
          )}
        </div>

        <div className="rounded-lg bg-accent-brand-light/40 px-4 py-3">
          <p className="text-small-leading leading-relaxed text-blue-800">
            {isScoreEqual ? (
              <>
                A compatibilidade com a vaga permaneceu em{" "}
                <span className="font-semibold">{finalScore}%</span>, mas ainda
                assim melhoramos seu currículo com ajustes de estrutura e
                destaque de habilidades.
              </>
            ) : (
              <>
                Você saiu de{" "}
                <span className="font-semibold">{initialScore}%</span> para{" "}
                <span className="font-semibold">{finalScore}%</span> de
                compatibilidade nesta vaga. Continue repetindo esse fluxo em
                todas as vagas para{" "}
                <span className="font-semibold">multiplicar</span> suas chances.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 p-6">
        <div className="flex gap-3">
          <Button
            type="button"
            size="brand"
            variant="outline"
            onClick={onReset}
            className="flex-1 gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Nova Análise
          </Button>
          {isAnalysisUnlocked ? (
            <Button
              size="brand"
              variant="outline"
              disabled={!displayResumeData || downloadingFormat !== null}
              onClick={() => onDownload("docx")}
              className="flex-1 gap-1.5"
            >
              {downloadingFormat === "docx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Baixar DOCX
            </Button>
          ) : (
            <Button
              size="brand"
              className="flex-1 gap-1.5"
              onClick={onUnlockClick}
              disabled={!analysisId || isUnlocking}
            >
              {isUnlocking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {isUnlocking ? "Desbloqueando..." : "Desbloquear"}
            </Button>
          )}
        </div>
        {downloadError && (
          <span className="text-sm text-destructive">{downloadError}</span>
        )}
        {isAnalysisUnlocked ? (
          <Button
            size="brand"
            disabled={!displayResumeData || downloadingFormat !== null}
            onClick={() => onDownload("pdf")}
            className="w-full gap-1.5"
          >
            {downloadingFormat === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <File className="h-4 w-4" />
            )}
            Baixar PDF
          </Button>
        ) : null}
      </div>
    </div>
  );
}
