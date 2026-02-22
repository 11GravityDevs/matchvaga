"use client";

import { NewAnalysisProvider } from "../_contexts/new-analysis-context";
import { WizardInner } from "./wizard-inner";

export function NewAnalysisContent() {
  return (
    <NewAnalysisProvider>
      <WizardInner />
    </NewAnalysisProvider>
  );
}
