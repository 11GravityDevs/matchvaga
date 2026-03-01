"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TriangleAlert, CircleCheck } from "lucide-react";

import { downloadOptimizedDocument } from "@/app/actions/document";
import { ROUTE_HOME_NEW_ANALYSIS } from "@/constants/routes";
import { DashboardHeader } from "./dashboard-header";
import { AnalysisHistoryTable } from "./analysis-history-table";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  formatAnalysisDate,
  getCompanyColor,
  getCompanyInitials,
} from "../_utils/format";
import { getScoreColorToken } from "../../new-analysis/_utils/analysis";
import { analysesQueryOptions } from "@/lib/query/query-options";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";

interface DashboardContentProps {
  userName: string;
  fromOnboarding?: boolean;
}

export function DashboardContent({
  userName,
  fromOnboarding = false,
}: DashboardContentProps) {
  const router = useRouter();
  const { data: analyses = [], isLoading } = useQuery(analysesQueryOptions);

  useEffect(() => {
    if (!isLoading && fromOnboarding) {
      router.replace(ROUTE_HOME_NEW_ANALYSIS);
    }
  }, [isLoading, fromOnboarding, router]);

  if (isLoading || fromOnboarding) {
    return <Loading className="min-h-0 flex-1" />;
  }

  const totalAnalyses = analyses.length;

  const completedWithScore = analyses.filter(
    (a) =>
      a.status === "completed" &&
      a.optimized_score != null &&
      a.optimized_score != 0
  );

  const avgScore =
    completedWithScore.length > 0
      ? Math.round(
          completedWithScore.reduce((sum, a) => sum + a.optimized_score, 0) /
            completedWithScore.length
        )
      : 0;

  const scoreVariant =
    avgScore >= 75 ? "success" : avgScore >= 50 ? "primary" : "destructive";

  const scoreBadge =
    avgScore >= 75 ? "Alto" : avgScore >= 50 ? "Médio" : "Baixo";

  const tableRows = analyses.map((a) => {
    const job = a.job_snapshot;
    const { bg: companyBg, text: companyTextColor } = getCompanyColor(
      job.company
    );

    const showOptimized = a.status === "completed" && a.optimized_score != 0;

    return {
      analysisId: a.id,
      role: job.title,
      company: job.company,
      companyInitials: getCompanyInitials(job.company),
      companyBg,
      companyTextColor,
      date: formatAnalysisDate(a.created_at),
      before: `${a.score}%`,
      beforeColor: getScoreColorToken(a.score),
      after: showOptimized ? `${a.optimized_score}%` : "—",
      afterColor: showOptimized
        ? getScoreColorToken(a.optimized_score!)
        : "var(--muted-foreground)",
      status: a.status,
    };
  });

  return (
    <main className="flex flex-1 flex-col section-gap page-padding">
      <DashboardHeader userName={userName} />

      {/* KPI Row */}
      <div className="flex w-full gap-4">
        <KpiCard
          label="Total de Otimizações"
          value={String(totalAnalyses)}
          variant="primary"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KpiCard
          label="Score Médio"
          value={`${avgScore}%`}
          variant={scoreVariant}
          icon={<TriangleAlert className="h-6 w-6" />}
          badge={{ label: scoreBadge }}
        />
        <KpiCard
          label="Análises Concluídas"
          value={String(totalAnalyses)}
          variant="success"
          icon={<CircleCheck className="h-6 w-6" />}
        />
      </div>

      <AnalysisHistoryTable
        rows={tableRows}
        activeFilter="todos"
        onDownload={downloadOptimizedDocument}
      />
    </main>
  );
}
