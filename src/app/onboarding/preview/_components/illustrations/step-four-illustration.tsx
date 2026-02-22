import { Check, Sparkles } from "lucide-react";

export function StepFourIllustration() {
  return (
    <div className="relative h-65 w-80">
      {/* Background */}
      <div className="absolute inset-0 rounded-3xl bg-green-50" />

      {/* Success circle */}
      <div className="absolute top-10 left-27.5 flex h-25 w-25 items-center justify-center rounded-full bg-emerald-500">
        <Check className="h-12 w-12 text-white" />
      </div>

      {/* Resume card */}
      <div className="absolute top-39 left-5 flex h-20 w-35 flex-col gap-1.5 rounded-lg bg-white p-2.5 shadow-md">
        <div className="h-1.5 w-full rounded bg-slate-300" />
        <div className="h-1.5 w-20 rounded bg-slate-300" />
        <div className="h-1.5 w-full rounded bg-slate-200" />
        <div className="h-1.5 w-15 rounded bg-slate-200" />
      </div>

      {/* Match card */}
      <div className="absolute top-45 left-42.5 flex h-12.5 w-35 flex-col gap-1 rounded-lg bg-white px-3 py-2 shadow-md">
        <span className="text-[11px] font-semibold text-emerald-500">
          Match Perfeito!
        </span>
        <div className="relative h-1.5 w-full rounded bg-green-100">
          <div className="absolute inset-y-0 left-0 w-10/12 rounded bg-emerald-500" />
        </div>
      </div>

      {/* Sparkles */}
      <Sparkles className="absolute top-12.5 left-15 h-5 w-5 text-amber-400" />
      <Sparkles className="absolute top-35 left-60 h-4 w-4 text-amber-400" />
    </div>
  );
}
