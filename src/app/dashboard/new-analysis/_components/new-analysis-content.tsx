"use client";

import { NewAnalysisProvider } from "../_contexts/new-analysis-context";
import { ContinueAnalysisLoader } from "./continue-analysis-loader";
import { WizardInner } from "./wizard-inner";

interface NewAnalysisContentProps {
  initialContinueId?: string | null;
}

export function NewAnalysisContent({
  initialContinueId = null,
}: NewAnalysisContentProps) {
  return (
    <NewAnalysisProvider>
      <ContinueAnalysisLoader initialContinueId={initialContinueId}>
        <WizardInner />
      </ContinueAnalysisLoader>
    </NewAnalysisProvider>
  );
}
