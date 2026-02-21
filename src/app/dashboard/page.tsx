import { TrendingUp, TriangleAlert, CircleCheck } from "lucide-react";

import { DashboardHeader } from "./_components/dashboard-header";
import { AnalysisHistoryTable } from "./_components/analysis-history-table";
import { KpiCard } from "@/components/shared/kpi-card";

const analysisHistory = [
  {
    id: 1,
    role: "Desenvolvedor Frontend",
    company: "Nubank",
    companyInitials: "N",
    companyBg: "#7C3AED",
    companyTextColor: "#FFFFFF",
    date: "15 Fev 2026",
    before: "38%",
    beforeColor: "var(--destructive)",
    after: "91%",
    afterColor: "var(--accent-success)",
  },
  {
    id: 2,
    role: "Product Designer",
    company: "iFood",
    companyInitials: "iF",
    companyBg: "#DC2626",
    companyTextColor: "#FFFFFF",
    date: "12 Fev 2026",
    before: "45%",
    beforeColor: "var(--destructive)",
    after: "85%",
    afterColor: "var(--accent-success)",
  },
  {
    id: 3,
    role: "Engenheiro de Dados",
    company: "Mercado Livre",
    companyInitials: "ML",
    companyBg: "#FACC15",
    companyTextColor: "#1E293B",
    date: "08 Fev 2026",
    before: "52%",
    beforeColor: "var(--destructive)",
    after: "88%",
    afterColor: "var(--accent-success)",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <DashboardHeader />

      {/* KPI Row */}
      <div className="flex w-full gap-4">
        <KpiCard
          label="Total de Otimizações"
          value="24"
          variant="primary"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KpiCard
          label="Score Médio Inicial"
          value="42%"
          variant="destructive"
          icon={<TriangleAlert className="h-6 w-6" />}
          badge={{ label: "Baixo" }}
        />
        <KpiCard
          label="Score Médio Otimizado"
          value="87%"
          variant="success"
          icon={<CircleCheck className="h-6 w-6" />}
          badge={{ label: "Alto" }}
        />
      </div>

      <AnalysisHistoryTable rows={analysisHistory} activeFilter="todos" />
    </div>
  );
}
