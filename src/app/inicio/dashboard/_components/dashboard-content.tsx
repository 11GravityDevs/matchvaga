"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Gauge, TrendingUp, CircleCheck } from "lucide-react";

import { downloadOptimizedDocument } from "@/app/actions/document-export";
import { ROUTE_HOME_NEW_ANALYSIS } from "@/constants/routes";
import { DashboardHeader } from "./dashboard-header";
import { AnalysisHistoryTable } from "./analysis-history-table";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  formatAnalysisDate,
  getCompanyColor,
  getCompanyInitials,
} from "../_utils/format";
import {
  analysesQueryOptions,
  currentUserDisplayQueryOptions,
} from "@/lib/query/query-options";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";
import { getScoreColorToken } from "../../nova-analise/_utils/analysis";

interface DashboardContentProps {
  userName: string;
  fromOnboarding?: boolean;
}

export function DashboardContent({
  userName,
  fromOnboarding = false,
}: DashboardContentProps) {
  const router = useRouter();
  const { data: analyses = [], isLoading: isAnalysesLoading } =
    useQuery(analysesQueryOptions);
  const { data: displayData, isLoading: isUserLoading } = useQuery(
    currentUserDisplayQueryOptions
  );

  const isLoading = isAnalysesLoading || isUserLoading;

  useEffect(() => {
    if (!isLoading && fromOnboarding) {
      router.replace(ROUTE_HOME_NEW_ANALYSIS);
    }
  }, [isLoading, fromOnboarding, router]);

  if (isLoading || fromOnboarding) {
    return <Loading className="min-h-0 flex-1" />;
  }

  const credits = displayData?.credits ?? 0;

  const totalAnalyses = analyses.length;
  const completedCount = analyses.filter(
    (a) => a.status === "completed"
  ).length;

  const avgScoreInitial =
    totalAnalyses > 0
      ? Math.round(
          analyses.reduce((sum, a) => sum + a.score, 0) / totalAnalyses
        )
      : 0;

  const completedWithScore = analyses.filter(
    (a) =>
      a.status === "completed" &&
      a.optimized_score != null &&
      a.optimized_score !== 0
  );
  const avgScoreFinal =
    completedWithScore.length > 0
      ? Math.round(
          completedWithScore.reduce((sum, a) => sum + a.optimized_score, 0) /
            completedWithScore.length
        )
      : 0;

  const scoreVariant = (score: number) =>
    score >= 75 ? "success" : score >= 50 ? "primary" : "destructive";
  const scoreBadge = (score: number) =>
    score >= 75 ? "Alto" : score >= 50 ? "Médio" : "Baixo";

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

      {totalAnalyses > 0 && (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Análises Disponíveis"
            value={String(credits)}
            variant="primary"
            icon={<Zap className="h-6 w-6" />}
          />
          <KpiCard
            label="Score Médio Inicial"
            value={`${avgScoreInitial}%`}
            variant={scoreVariant(avgScoreInitial)}
            icon={<Gauge className="h-6 w-6" />}
            badge={{ label: scoreBadge(avgScoreInitial) }}
          />
          <KpiCard
            label="Score Médio Final"
            value={`${avgScoreFinal}%`}
            variant={scoreVariant(avgScoreFinal)}
            icon={<TrendingUp className="h-6 w-6" />}
            badge={{ label: scoreBadge(avgScoreFinal) }}
          />
          <KpiCard
            label="Análises Finalizadas"
            value={String(completedCount)}
            variant="success"
            icon={<CircleCheck className="h-6 w-6" />}
          />
        </div>
      )}

      <AnalysisHistoryTable
        rows={tableRows}
        onDownload={downloadOptimizedDocument}
      />
    </main>
  );
}
