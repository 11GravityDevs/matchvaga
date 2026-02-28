"use client";

import { NewAnalysisProvider } from "../_contexts/new-analysis-context";
import { ContinueAnalysisLoader } from "./continue-analysis-loader";
import { WizardInner } from "./wizard-inner";

export function NewAnalysisContent() {
  return (
    <NewAnalysisProvider>
      <ContinueAnalysisLoader>
        <WizardInner />
      </ContinueAnalysisLoader>
    </NewAnalysisProvider>
  );
}
