"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";

import { runGapAnalysis } from "@/app/actions/analysis";
import { QUERY_KEY_ANALYSES } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Loading } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import { ROUTE_ONBOARDING_UPLOAD } from "@/constants/routes";
import { StepIndicator } from "@/components/shared/step-indicator";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";

export function StepJobInput() {
  const queryClient = useQueryClient();
  const {
    resumeId,
    isLoadingResume,
    jobDescription,
    setJobDescription,
    setJobRole,
    setStep,
    setAnalysisResult,
  } = useNewAnalysis();

  const {
    mutate: runAnalysis,
    isPending: isAnalyzing,
    error: analysisError,
  } = useMutation({
    mutationFn: async () => {
      if (!resumeId) throw new Error("Currículo não encontrado.");
      const result = await runGapAnalysis(resumeId, jobDescription.trim());
      if (!result.success) {
        throw new Error(result.error ?? "Erro ao analisar. Tente novamente.");
      }
      return result;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY_ANALYSES });
      const roleLabel =
        result.job_title && result.job_company
          ? `${result.job_title} - ${result.job_company}`
          : (result.job_title ?? result.job_company ?? "Vaga");
      setJobRole(roleLabel);
      setAnalysisResult({
        analysisId: result.analysisId!,
        score: result.score!,
        matchedSkills: result.matched_skills!,
        missingSkills: result.missing_skills!,
      });
      setStep(2);
    },
  });

  const canAnalyze =
    jobDescription.trim().length > 0 && !!resumeId && !isAnalyzing;

  const handleAnalyze = () => {
    runAnalysis();
  };

  const analysisErrorDisplay =
    analysisError instanceof Error
      ? analysisError.message
      : analysisError
        ? String(analysisError)
        : null;

  if (isLoadingResume) {
    return <Loading className="min-h-0 flex-1" />;
  }

  if (!resumeId) {
    return (
      <div className="mx-auto flex min-h-0 w-full max-w-content flex-1 flex-col section-gap overflow-hidden page-padding">
        <div className="flex flex-col gap-4">
          <h1 className="text-page-title">Nenhum currículo encontrado</h1>
          <p className="text-page-subtitle">
            Faça o upload do seu currículo para começar uma análise.
          </p>
          <Link
            href={ROUTE_ONBOARDING_UPLOAD}
            className="text-primary underline hover:no-underline"
          >
            Ir para upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-content flex-1 flex-col section-gap overflow-hidden page-padding">
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
                placeholder="Exemplo: Estamos procurando um desenvolvedor full-stack com experiência em React e Node.js para trabalhar em nosso time de produto..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </Field>

          {analysisErrorDisplay && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {analysisErrorDisplay}
            </div>
          )}

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
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Analisar vaga
        </Button>
      </div>
    </div>
  );
}
