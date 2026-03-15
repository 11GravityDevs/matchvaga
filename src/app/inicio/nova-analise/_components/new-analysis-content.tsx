"use client";

import { useNewAnalysisReset } from "@/app/inicio/_contexts/new-analysis-reset-context";
import { NewAnalysisProvider } from "../_contexts/new-analysis-context";
import { WizardInner } from "./wizard-inner";

interface NewAnalysisContentProps {
  initialContinueId?: string | null;
}

export function NewAnalysisContent({
  initialContinueId = null,
}: NewAnalysisContentProps) {
  const resetKey = useNewAnalysisReset();

  return (
    <NewAnalysisProvider key={resetKey} initialContinueId={initialContinueId}>
      <WizardInner />
    </NewAnalysisProvider>
  );
}
