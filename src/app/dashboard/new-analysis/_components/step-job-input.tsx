"use client";

import Link from "next/link";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";

import { runGapAnalysis } from "@/app/actions/analysis";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ROUTE_ONBOARDING_UPLOAD } from "@/constants/routes";
import { StepIndicator } from "@/components/shared/step-indicator";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";

export function StepJobInput() {
  const {
    resumeId,
    isLoadingResume,
    jobTitle,
    jobCompany,
    jobDescription,
    setJobTitle,
    setJobCompany,
    setJobDescription,
    setJobRole,
    setStep,
    setAnalysisResult,
    setAnalysisError,
    setIsAnalyzing,
    isAnalyzing,
    analysisError,
  } = useNewAnalysis();

  const canAnalyze =
    jobTitle.trim().length > 0 &&
    jobCompany.trim().length > 0 &&
    jobDescription.trim().length > 0 &&
    !!resumeId &&
    !isAnalyzing;

  const handleAnalyze = async () => {
    if (!resumeId) return;

    setAnalysisError(null);
    setIsAnalyzing(true);

    const result = await runGapAnalysis(resumeId, {
      title: jobTitle.trim(),
      company: jobCompany.trim(),
      rawText: jobDescription.trim(),
    });

    setIsAnalyzing(false);

    if (!result.success) {
      setAnalysisError(result.error ?? "Erro ao analisar. Tente novamente.");
      return;
    }

    if (
      result.analysisId &&
      result.score !== undefined &&
      result.matched_skills &&
      result.missing_skills
    ) {
      setJobRole(`${jobTitle.trim()} - ${jobCompany.trim()}`);
      setAnalysisResult({
        analysisId: result.analysisId,
        score: result.score,
        matchedSkills: result.matched_skills,
        missingSkills: result.missing_skills,
      });
      setStep(2);
    }
  };

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="flex flex-col gap-1.5">
              <FieldLabel className="text-base leading-snug font-semibold">
                Cargo
              </FieldLabel>
              <FieldDescription>
                Ex: Desenvolvedor Frontend, Product Designer
              </FieldDescription>
              <Input
                placeholder="Cargo da vaga"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </Field>
            <Field className="flex flex-col gap-1.5">
              <FieldLabel className="text-base leading-snug font-semibold">
                Empresa
              </FieldLabel>
              <FieldDescription>
                Nome da empresa ou instituição
              </FieldDescription>
              <Input
                placeholder="Nome da empresa"
                value={jobCompany}
                onChange={(e) => setJobCompany(e.target.value)}
              />
            </Field>
          </div>

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

          {analysisError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {analysisError}
            </div>
          )}

          {/* Tip Banner */}
          <div className="flex items-start gap-2 self-start rounded-lg border border-accent-success-border bg-accent-success-light tip-banner-padding">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-success" />
            <p className="text-small-leading text-accent-success-text">
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
