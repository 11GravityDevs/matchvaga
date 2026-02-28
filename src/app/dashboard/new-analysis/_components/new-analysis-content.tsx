"use client";

import { NewAnalysisProvider } from "../_contexts/new-analysis-context";
import { WizardInner } from "./wizard-inner";

interface NewAnalysisContentProps {
  initialContinueId?: string | null;
}

export function NewAnalysisContent({
  initialContinueId = null,
}: NewAnalysisContentProps) {
  return (
    <NewAnalysisProvider initialContinueId={initialContinueId}>
      <WizardInner />
    </NewAnalysisProvider>
  );
}
