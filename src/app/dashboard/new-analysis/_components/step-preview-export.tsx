"use client";

import { useState } from "react";
import { Download, FileText, Loader2, RefreshCw, Send } from "lucide-react";

import { applyCvRefinementInstruction } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useNewAnalysis,
  WIZARD_STEPS,
} from "../_contexts/new-analysis-context";
import { StepIndicator } from "@/components/shared/step-indicator";
import { ResumePreviewDocument } from "./resume-preview-document";

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
    score,
    reset,
  } = useNewAnalysis();

  const displayResumeData = optimizedResumeData ?? resumeData;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

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

  const displayScore = score ?? 0;

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
              <div className="flex items-center justify-center rounded-full bg-accent-success px-2.5 py-1">
                <span className="text-xs font-semibold text-white">
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
          <Button
            size="brand"
            variant="outline"
            className="gap-1.5"
            disabled
            title="Em breve"
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
          <Button size="brand" disabled className="gap-1.5" title="Em breve">
            <Download className="h-4 w-4" />
            Download DOCX
          </Button>
        </div>
      </div>
    </div>
  );
}
