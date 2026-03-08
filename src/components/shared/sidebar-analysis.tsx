"use client";

import { FileText } from "lucide-react";

import { ConfirmLeaveLink } from "@/components/shared/confirm-leave-link";
import { ROUTE_HOME_CHECKOUT } from "@/constants/routes";

interface SidebarAnalysisProps {
  analysis: number;
}

export function SidebarAnalysis({ analysis }: SidebarAnalysisProps) {
  const safeCount = Math.max(0, analysis);
  const hasAnalyses = safeCount > 0;

  const label = hasAnalyses
    ? safeCount === 1
      ? "análise restante"
      : "análises restantes"
    : "Nenhuma análise disponível";

  return (
    <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-accent-brand to-accent-brand-end p-4">
      <FileText className="absolute -top-1 right-3 h-12 w-12 rotate-12 text-on-accent-brand opacity-10" />

      <div className="relative flex flex-col gap-3">
        <div>
          <p className="text-2xl font-bold tracking-tight text-on-accent-brand">
            {safeCount}
          </p>
          <p className="text-sm font-medium text-on-accent-brand/80">{label}</p>
        </div>

        <ConfirmLeaveLink
          href={ROUTE_HOME_CHECKOUT}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-on-accent-brand py-2 text-sm font-semibold text-accent-brand transition-colors hover:bg-on-accent-brand/90"
        >
          Comprar Análises
        </ConfirmLeaveLink>
      </div>
    </div>
  );
}
