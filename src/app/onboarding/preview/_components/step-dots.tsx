import { cn } from "@/utils/style";

interface StepDotsProps {
  currentStep: number;
  totalSteps: number;
}

export function StepDots({ currentStep, totalSteps }: StepDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i === currentStep;
        const isLast = i === totalSteps - 1;
        const activeColor =
          isLast && isActive ? "bg-emerald-500" : "bg-accent-brand";

        return (
          <div
            key={i}
            className={cn(
              "h-2 rounded",
              isActive ? `w-8 ${activeColor}` : "w-2 bg-slate-200"
            )}
          />
        );
      })}
    </div>
  );
}
