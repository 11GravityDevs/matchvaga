"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, Sparkles } from "lucide-react";
import { runSkillsMatch } from "@/app/actions/analysis";
import { JOB_DESCRIPTION_MAX } from "@/constants/job";
import {
  QUERY_KEY_ANALYSES,
  QUERY_KEY_CURRENT_USER_DISPLAY,
} from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import { StepIndicator } from "@/components/shared/step-indicator";
import { useToastNotification } from "@/hooks/use-toast-notification";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";
import { formatJobRoleLabel } from "../_utils/format-job-role-label";

const GAP_ANALYSIS_THINKING_MESSAGES = [
  "Analisando descrição da vaga...",
  "Comparando com seu currículo...",
  "Calculando compatibilidade...",
  "Identificando habilidades em falta...",
  "Quase lá...",
] as const;

export function StepJobInput() {
  const queryClient = useQueryClient();

  const {
    jobDescription,
    setJobDescription,
    setJobRole,
    setStep,
    setAnalysisResult,
  } = useNewAnalysis();
  const { showErrorToastNotification } = useToastNotification();

  const { mutate: runAnalysis, isPending: isAnalyzing } = useMutation({
    mutationFn: async () => {
      const result = await runSkillsMatch(jobDescription.trim());

      if (!result.success) {
        throw new Error(result.error ?? "Erro ao analisar. Tente novamente.");
      }

      return result;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY_ANALYSES });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
      });

      setJobRole(formatJobRoleLabel(result.job_title, result.job_company));

      setAnalysisResult({
        analysisId: result.analysisId!,
        score: result.score ?? 0,
        matchedSkillsCount: result.matched_skills_count ?? 0,
        hardSkills: (result.missing_hard_skills ?? []).map((s) => s.name),
        softSkills: (result.missing_soft_skills ?? []).map((s) => s.name),
      });

      setStep(2);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao analisar. Tente novamente.";
      showErrorToastNotification(message);
    },
  });

  const canAnalyze = jobDescription.trim().length > 0 && !isAnalyzing;

  const handleAnalyze = () => {
    runAnalysis();
  };

  if (isAnalyzing) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col items-center section-gap overflow-hidden page-padding">
        <div className="flex min-h-0 w-content flex-1 flex-col">
          <Loading
            thinkingMessages={[...GAP_ANALYSIS_THINKING_MESSAGES]}
            className="min-h-0 flex-1"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center section-gap overflow-hidden page-padding">
      <div className="flex min-h-0 w-content flex-1 flex-col section-gap">
        {/* Page Header */}
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-page-title">Nova Análise</h1>
            <p className="text-page-subtitle">
              Cole a descrição da vaga para analisar a compatibilidade.
            </p>
          </div>
          <StepIndicator steps={WIZARD_STEPS} currentStepIndex={0} />
        </div>

        {/* Job Description Card */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto card-content-padding">
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
                  maxLength={JOB_DESCRIPTION_MAX}
                  placeholder="Exemplo: Estamos procurando um desenvolvedor full-stack com experiência em React e Node.js para trabalhar em nosso time de produto..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </Field>

            {/* Tip Banner */}
            <div className="flex items-start gap-2 self-start rounded-lg border border-accent-success-border bg-accent-success-light tip-banner-padding">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-success" />
              <p className="text-small-leading text-accent-success-text">
                <span className="font-semibold">Dica:</span> Cole a descrição
                completa da vaga. Cargo e empresa são identificados
                automaticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            size="brand"
            disabled={!canAnalyze}
            onClick={handleAnalyze}
            className="gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            Analisar vaga
          </Button>
        </div>
      </div>
    </div>
  );
}
