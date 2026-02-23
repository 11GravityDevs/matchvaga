import { TrendingUp, TriangleAlert, CircleCheck } from "lucide-react";

import { getAnalysesForUser } from "@/app/actions/analysis";
import { generateOptimizedDocument } from "@/app/actions/document";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "./_components/dashboard-header";
import { AnalysisHistoryTable } from "./_components/analysis-history-table";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  formatAnalysisDate,
  getCompanyColor,
  getCompanyInitials,
} from "./_utils/format";
import { getScoreColorToken } from "./new-analysis/_utils/analysis";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuário";

  const analysesResult = await getAnalysesForUser();

  const analyses = analysesResult.success ? (analysesResult.data ?? []) : [];
  const totalAnalyses = analyses.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(
          analyses.reduce((sum, a) => sum + a.score, 0) / totalAnalyses
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
      after: "—",
      afterColor: "var(--muted-foreground)",
    };
  });

  return (
    <div className="flex flex-1 flex-col section-gap page-padding">
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
        onDownload={generateOptimizedDocument}
      />
    </div>
  );
}
