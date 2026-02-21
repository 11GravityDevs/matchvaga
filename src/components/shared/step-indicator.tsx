import { Check } from "lucide-react";

import { cn } from "@/utils/style";

export interface StepIndicatorStep {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: StepIndicatorStep[];
  currentStepIndex: number;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStepIndex,
  className,
}: StepIndicatorProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="progressbar"
      aria-valuenow={currentStepIndex + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Passo ${currentStepIndex + 1} de ${steps.length}`}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isPast = index < currentStepIndex;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1 rounded-2xl px-3.5 py-1.5",
                isActive && "bg-accent-brand text-primary-foreground",
                isPast && "bg-muted text-foreground",
                !isActive && !isPast && "bg-muted text-muted-foreground"
              )}
            >
              {isPast ? (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0 text-accent-success" />
                  <span className="text-[13px] font-medium">{step.label}</span>
                </>
              ) : (
                <span
                  className={cn(
                    "text-[13px]",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {index + 1}. {step.label}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="h-px w-6 bg-border" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
