import { Search, ChartBar } from "lucide-react";

export function StepTwoIllustration() {
  return (
    <div className="relative h-65 w-80">
      {/* Background */}
      <div className="absolute inset-0 rounded-3xl bg-green-50" />

      {/* Search bar */}
      <div className="absolute top-7.5 left-15 flex h-11 w-52.5 items-center gap-2 rounded-lg bg-white px-3.5 shadow-md">
        <Search className="h-4 w-4 text-slate-400" />
        <span className="text-[13px] text-slate-400">
          Cole a descrição da vaga...
        </span>
      </div>

      {/* Result card */}
      <div className="absolute top-25 left-12.5 flex h-30 w-55 flex-col gap-2.5 rounded-xl bg-white p-3.5 shadow-md">
        <div className="h-1.5 w-full rounded bg-slate-300" />
        <div className="h-1.5 w-30 rounded bg-slate-300" />

        {/* Progress bar */}
        <div className="relative h-1.5 w-full rounded bg-slate-200">
          <div className="absolute inset-y-0 left-0 w-8/12 rounded bg-emerald-500" />
        </div>

        {/* Score row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Match Score
          </span>
          <span className="text-sm font-bold text-emerald-500">87%</span>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-600">
            React
          </span>
          <span className="rounded-md bg-green-100 px-2 py-1 text-[10px] font-medium text-emerald-600">
            Node.js
          </span>
          <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-600">
            SQL
          </span>
        </div>
      </div>

      {/* Analyze badge */}
      <div className="absolute top-15 left-61 flex h-13 w-13 items-center justify-center rounded-full bg-accent-brand">
        <ChartBar className="h-5.5 w-5.5 text-white" />
      </div>
    </div>
  );
}
