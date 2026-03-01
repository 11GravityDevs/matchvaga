"use client";

import { FileText } from "lucide-react";

function getAnalysisRemainingLabel(count: number): string {
  const safeCount = Math.max(0, count);
  if (safeCount === 0) {
    return "Você não tem análises";
  }
  const noun = safeCount === 1 ? "análise" : "análises";
  const adjective = safeCount === 1 ? "restante" : "restantes";
  return `${safeCount} ${noun} ${adjective}`;
}

interface SidebarAnalysisProps {
  analysis: number;
}

export function SidebarAnalysis({ analysis }: SidebarAnalysisProps) {
  const label = getAnalysisRemainingLabel(analysis);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-accent-brand px-3 py-2.5">
      <FileText className="h-4 w-4 shrink-0 text-on-accent-brand" />
      <span className="text-sm font-semibold text-on-accent-brand">
        {label}
      </span>
    </div>
  );
}
