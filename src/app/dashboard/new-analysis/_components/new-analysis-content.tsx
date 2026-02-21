"use client";

import { NewAnalysisProvider } from "./new-analysis-context";
import { WizardInner } from "./wizard-inner";

export function NewAnalysisContent() {
  return (
    <NewAnalysisProvider>
      <WizardInner />
    </NewAnalysisProvider>
  );
}
