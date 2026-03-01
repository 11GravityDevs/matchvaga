"use client";

import { useState } from "react";
import { FileCheck, FileText, Loader2, RefreshCw, Send } from "lucide-react";

import { applyCvRefinementInstruction } from "@/app/actions/chat";
import { generateOptimizedDocument } from "@/app/actions/document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";
import { getScoreFeedback } from "../_utils/analysis";
import { StepIndicator } from "@/components/shared/step-indicator";
import { ResumePreviewDocument } from "./resume-preview-document";
import { cn } from "@/utils/style";

const FEEDBACK_BADGE_CLASSES = {
  success:
    "border-accent-success-border bg-accent-success-light text-accent-success-text",
  warning:
    "border-accent-warning-border bg-accent-warning-light text-accent-warning-text",
  low: "border-accent-low-border bg-accent-low-light text-accent-low-text",
} as const;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function StepPreviewExport() {
  const {
    jobRole,
    resumeData,
    optimizedResumeData,
    setOptimizedResumeData,
    analysisId,
    optimizedScore,
    reset,
  } = useNewAnalysis();

  const displayResumeData = optimizedResumeData ?? resumeData;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

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

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || !analysisId || !displayResumeData || isSending) return;

    setChatError(null);
    setInput("");
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    const prevMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await applyCvRefinementInstruction(
      analysisId,
      displayResumeData,
      trimmed,
      prevMessages
    );
    setIsSending(false);

    if (!result.success) {
      setChatError(result.error ?? "Erro ao aplicar alteração.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
      return;
    }

    if (result.modifiedResume) {
      setOptimizedResumeData(result.modifiedResume);
    }
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant" as const,
        content: result.summary ?? "Alterações aplicadas.",
      },
    ]);
  }

  const displayScore = optimizedScore ?? 0;
  const feedback = getScoreFeedback(displayScore);
  const feedbackBadgeClasses = FEEDBACK_BADGE_CLASSES[feedback.variant];

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
                  {displayScore}% Match
                </span>
              </div>
            </div>

            {/* Doc body — scrollable */}
            <div className="flex min-h-0 flex-1 flex-col overflow-auto card-content-padding">
              {displayResumeData ? (
                <ResumePreviewDocument data={displayResumeData} />
              ) : (
                <p className="text-small text-muted-foreground">
                  Carregando currículo...
                </p>
              )}
            </div>
          </div>

          {/* Right — Refinement chat (fixed, non-scrolling) */}
          <div className="flex w-column shrink-0 flex-col self-stretch overflow-hidden rounded-xl border border-border bg-card">
            {/* Chat header */}
            <div className="flex shrink-0 flex-col gap-1 border-b border-border card-header-padding">
              <span className="text-base font-semibold text-foreground">
                Refinamento
              </span>
              <span className="text-small-leading text-muted-foreground">
                Ajuste o currículo com instruções
              </span>
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-3 overflow-auto card-content-padding">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Envie uma mensagem para obter sugestões de melhoria no
                  currículo.
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      msg.role === "assistant"
                        ? "flex max-w-[90%] flex-col gap-1 rounded-xl rounded-bl-md bg-muted px-4 py-3"
                        : "flex max-w-[90%] flex-col gap-1 rounded-xl rounded-br-md bg-accent-brand px-4 py-3"
                    }
                  >
                    <span
                      className={
                        msg.role === "assistant"
                          ? "text-badge text-accent-brand"
                          : "text-badge text-white/70"
                      }
                    >
                      {msg.role === "assistant" ? "Assistente" : "Você"}
                    </span>
                    <p
                      className={
                        msg.role === "assistant"
                          ? "text-small-leading leading-relaxed text-foreground"
                          : "text-small-leading leading-relaxed text-white"
                      }
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl rounded-bl-md bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-accent-brand" />
                    <span className="text-sm text-muted-foreground">
                      Pensando...
                    </span>
                  </div>
                </div>
              )}
              {chatError && (
                <p className="text-sm text-destructive">{chatError}</p>
              )}
            </div>

            {/* Input row */}
            <div className="flex shrink-0 items-center gap-2 px-7 pt-0 pb-7">
              <div className="flex flex-1 items-center rounded-lg border border-input bg-background px-3">
                <Input
                  className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  placeholder={
                    displayResumeData
                      ? "Digite uma instrução..."
                      : "Aguarde o currículo carregar..."
                  }
                  disabled={!displayResumeData}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                size="icon"
                className="shrink-0 rounded-lg bg-accent-brand hover:bg-accent-brand-hover"
                disabled={!input.trim() || isSending || !displayResumeData}
                onClick={handleSend}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer action row */}
      <div className="flex shrink-0 items-center justify-between border-border">
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={reset}
          className="gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Nova Análise
        </Button>

        <div className="flex items-center gap-3">
          {downloadError && (
            <span className="text-sm text-destructive">{downloadError}</span>
          )}
          <Button
            size="brand"
            variant="outline"
            disabled={!displayResumeData || downloadingFormat !== null}
            onClick={() => handleDownload("docx")}
            className="gap-1.5"
          >
            {downloadingFormat === "docx" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Download DOCX
          </Button>

          <Button
            size="brand"
            disabled={!displayResumeData || downloadingFormat !== null}
            onClick={() => handleDownload("pdf")}
            className="gap-1.5"
          >
            {downloadingFormat === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCheck className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
