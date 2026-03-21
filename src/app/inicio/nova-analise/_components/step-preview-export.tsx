"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { downloadOptimizedDocument } from "@/app/actions/document-export";
import { unlockAnalysis } from "@/app/actions/document-preview";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/shared/step-indicator";
import { useToastNotification } from "@/hooks/use-toast-notification";
import { QUERY_KEY_CURRENT_USER_DISPLAY } from "@/constants/query-keys";
import { cn } from "@/utils/style";
import {
  QUERY_CONTINUE_ANALYSIS,
  QUERY_PAYMENT_RETURN,
  QUERY_SESSION_ID,
  ROUTE_HOME_NEW_ANALYSIS,
} from "@/constants/routes";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";
import { getScoreFeedback } from "../_utils/analysis";
import { UnlockPaymentModal } from "./unlock-payment-modal";
import { ResumePreviewDocument } from "./resume-preview-document";
import { StepPreviewOptimizationPanel } from "./step-preview-optimization-panel";

const FEEDBACK_BADGE_CLASSES = {
  success:
    "border-accent-success-border bg-accent-success-light text-accent-success-text",
  warning:
    "border-accent-warning-border bg-accent-warning-light text-accent-warning-text",
  low: "border-accent-low-border bg-accent-low-light text-accent-low-text",
} as const;

export function StepPreviewExport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { showErrorToastNotification } = useToastNotification();

  const {
    jobRole,
    resumeData,
    optimizedResumeData,
    analysisId,
    isAnalysisUnlocked,
    score,
    optimizedScore,
    matchedSkillsCount,
    selectedHardSkills,
    selectedSoftSkills,
    reset,
    setOptimizedResumeData,
    setOptimizedScore,
    setNeedsUnlock,
  } = useNewAnalysis();

  const displayResumeData = optimizedResumeData ?? resumeData;

  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [initialProcessingFromRedirect, setInitialProcessingFromRedirect] =
    useState<{ sessionId: string } | undefined>(undefined);

  useEffect(() => {
    const paymentReturn = searchParams.get(QUERY_PAYMENT_RETURN);
    const sessionId = searchParams.get(QUERY_SESSION_ID);
    const continueAnalysisId = searchParams.get(QUERY_CONTINUE_ANALYSIS);

    if (
      paymentReturn === "1" &&
      sessionId &&
      analysisId &&
      continueAnalysisId === analysisId
    ) {
      setIsUnlockModalOpen(true);
      setInitialProcessingFromRedirect({ sessionId });
      router.replace(ROUTE_HOME_NEW_ANALYSIS, { scroll: false });
    }
  }, [searchParams, analysisId, router]);
  const [downloadingFormat, setDownloadingFormat] = useState<
    "pdf" | "docx" | null
  >(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload(format: "pdf" | "docx") {
    if (!analysisId || downloadingFormat) return;

    setDownloadingFormat(format);
    setDownloadError(null);

    try {
      const result = await downloadOptimizedDocument(analysisId, format);

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
  const isScoreEqual = initialScore === finalScore;
  const gainPoints = hasGain ? finalScore - initialScore : 0;

  const feedback = getScoreFeedback(finalScore);
  const feedbackBadgeClasses = FEEDBACK_BADGE_CLASSES[feedback.variant];

  const skillsPresentCount = matchedSkillsCount;
  const skillsAddedCount =
    selectedHardSkills.length + selectedSoftSkills.length;

  const { mutate: unlockWithCredits, isPending: isUnlocking } = useMutation({
    mutationFn: async () => {
      if (!analysisId) {
        throw new Error("Análise não encontrada.");
      }

      const result = await unlockAnalysis(analysisId);

      if (!result.success) {
        throw new Error(
          result.error ??
            "Erro ao desbloquear currículo. Tente novamente em instantes."
        );
      }

      return result;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
      });
      setOptimizedResumeData(result.data ?? null);
      setOptimizedScore(result.optimizedScore ?? null);
      setNeedsUnlock(false);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao desbloquear currículo. Tente novamente em instantes.";
      showErrorToastNotification(message);
    },
  });

  const handleUnlockClick = () => {
    if (!analysisId || isUnlocking) return;

    const userDisplay =
      queryClient.getQueryData<{ credits?: number }>(
        QUERY_KEY_CURRENT_USER_DISPLAY
      ) ?? undefined;

    const credits = userDisplay?.credits ?? 0;

    if (credits >= 1) {
      unlockWithCredits();
      return;
    }

    setIsUnlockModalOpen(true);
  };

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

            {/* Doc body — scrollable when unlocked, hidden scrollbar when blurred */}
            <div
              className={cn(
                "relative flex min-h-0 flex-1 flex-col p-16",
                !isAnalysisUnlocked
                  ? "overflow-hidden select-none"
                  : "overflow-auto"
              )}
            >
              {displayResumeData ? (
                <>
                  <ResumePreviewDocument data={displayResumeData} />
                  {!isAnalysisUnlocked && (
                    <div
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-[3px]"
                      aria-hidden="true"
                    >
                      <Lock className="size-12 text-muted-foreground" />
                      <p className="text-center text-section-header text-foreground">
                        Currículo pronto para desbloquear
                      </p>
                      <p className="max-w-sm text-center text-small-leading text-muted-foreground">
                        Compre 1 análise para baixar o currículo otimizado em
                        PDF ou DOCX.
                      </p>
                      <Button
                        size="brand"
                        className="gap-1.5"
                        onClick={handleUnlockClick}
                        disabled={!analysisId || isUnlocking}
                      >
                        {isUnlocking ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                            Desbloqueando...
                          </span>
                        ) : (
                          <>
                            <Lock className="size-4" />
                            Desbloquear
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-small text-muted-foreground">
                  Carregando currículo...
                </p>
              )}
            </div>
          </div>

          <StepPreviewOptimizationPanel
            finalScore={finalScore}
            initialScore={initialScore}
            hasGain={hasGain}
            isScoreEqual={isScoreEqual}
            gainPoints={gainPoints}
            feedbackBadgeClasses={feedbackBadgeClasses}
            feedbackLabel={feedback.label}
            skillsPresentCount={skillsPresentCount}
            skillsAddedCount={skillsAddedCount}
            isAnalysisUnlocked={isAnalysisUnlocked}
            analysisId={analysisId}
            displayResumeData={displayResumeData}
            downloadingFormat={downloadingFormat}
            downloadError={downloadError}
            isUnlocking={isUnlocking}
            onReset={reset}
            onDownload={handleDownload}
            onUnlockClick={handleUnlockClick}
          />
        </div>
      </div>

      {analysisId && (
        <UnlockPaymentModal
          open={isUnlockModalOpen}
          onOpenChange={(open) => {
            setIsUnlockModalOpen(open);
            if (!open) setInitialProcessingFromRedirect(undefined);
          }}
          analysisId={analysisId}
          onUnlockSuccess={(result) => {
            setOptimizedResumeData(result.data ?? null);
            setOptimizedScore(result.optimizedScore ?? null);
            setNeedsUnlock(false);
          }}
          initialProcessingFromRedirect={initialProcessingFromRedirect}
        />
      )}
    </div>
  );
}
