import { useNewAnalysis } from "./new-analysis-context";
import { StepGapAnalysis } from "./step-gap-analysis";
import { StepJobInput } from "./step-job-input";
import { StepPreviewExport } from "./step-preview-export";

export function WizardInner() {
  const { step } = useNewAnalysis();

  return (
    <div className="flex min-h-0 flex-1 flex-col [--primary:var(--accent-brand)]">
      {step === 1 && <StepJobInput />}
      {step === 2 && <StepGapAnalysis />}
      {step === 3 && <StepPreviewExport />}
    </div>
  );
}
