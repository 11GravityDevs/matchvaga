import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StepIndicatorStep {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: StepIndicatorStep[];
  currentStepIndex: number;
  variant?: "circle" | "pill";
  className?: string;
}

export function StepIndicator({
  steps,
  currentStepIndex,
  variant = "pill",
  className,
}: StepIndicatorProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3", className)}
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
            {variant === "circle" ? (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
                    isActive && "bg-[#2563EB] text-white",
                    !isActive &&
                      "border border-border bg-transparent text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isActive && "font-semibold text-[#2563EB]",
                    !isActive && "font-normal text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-3.5 py-1.5",
                  isActive && "bg-[#2563EB] text-white",
                  isPast && "bg-[#F1F5F9] text-foreground",
                  !isActive && !isPast && "bg-[#F1F5F9] text-muted-foreground"
                )}
              >
                {isPast ? (
                  <>
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#10B981]" />
                    <span className="text-[13px] font-medium">
                      {step.label}
                    </span>
                  </>
                ) : (
                  <span className="text-[13px] font-semibold">
                    {index + 1}. {step.label}
                  </span>
                )}
              </div>
            )}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 rounded-sm",
                  isPast ? "bg-[#10B981]" : "bg-[#CBD5E1]"
                )}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
