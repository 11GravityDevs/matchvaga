import { Check } from "lucide-react";

import { cn } from "@/utils/style";
import {
  TEXT_SMALL_MEDIUM,
  TEXT_SMALL_SEMIBOLD,
} from "@/constants/design-tokens";

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
      className={cn("flex items-center gap-2", className)}
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
            {index > 0 && (
              <div className="h-px w-8 shrink-0 bg-border" aria-hidden />
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5",
                isActive &&
                  "bg-accent-brand font-semibold text-white shadow-[0_2px_8px_rgba(37,99,235,0.2)]",
                isPast &&
                  "border border-accent-brand-light bg-muted text-foreground",
                !isActive &&
                  !isPast &&
                  "border border-border bg-muted text-muted-foreground"
              )}
            >
              {isPast && (
                <Check className="h-3.5 w-3.5 shrink-0 text-accent-success" />
              )}
              <span
                className={cn(
                  isActive ? TEXT_SMALL_SEMIBOLD : TEXT_SMALL_MEDIUM
                )}
              >
                {isActive ? `${index + 1}. ${step.label}` : step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
