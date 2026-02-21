import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type FilterType = "todos" | "recentes" | "score-alto";

interface AnalysisRow {
  id: number;
  role: string;
  company: string;
  companyInitials: string;
  companyBg: string;
  companyTextColor: string;
  date: string;
  before: string;
  beforeColor: string;
  after: string;
  afterColor: string;
}

interface AnalysisHistoryTableProps {
  rows: AnalysisRow[];
  activeFilter?: FilterType;
}

const filters: { label: string; value: FilterType }[] = [
  { label: "Todos", value: "todos" },
  { label: "Recentes", value: "recentes" },
  { label: "Score Alto", value: "score-alto" },
];

export function AnalysisHistoryTable({
  rows,
  activeFilter = "todos",
}: AnalysisHistoryTableProps) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Section Header - outside card */}
      <div className="flex w-full items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Histórico de Análises
        </h2>
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={f.value === activeFilter ? "default" : "outline"}
              size="xs"
              className="rounded-full"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        {/* Header Row */}
        <div className="flex w-full items-center border-b border-border bg-muted/50">
          <div className="flex min-w-0 flex-[1.5] items-center gap-2 border-b-0 p-3">
            <span className="truncate text-sm leading-[1.43] text-muted-foreground">
              Cargo
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 p-3">
            <span className="truncate text-sm leading-[1.43] text-muted-foreground">
              Empresa
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 p-3">
            <span className="truncate text-sm leading-[1.43] text-muted-foreground">
              Data
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 p-3">
            <span className="truncate text-sm leading-[1.43] text-muted-foreground">
              Antes
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 p-3">
            <span className="truncate text-sm leading-[1.43] text-muted-foreground">
              Depois
            </span>
          </div>
          <div className="flex w-[100px] shrink-0 p-3" />
        </div>

        {/* Data Rows */}
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex w-full items-center border-b border-border last:border-b-0"
          >
            {/* Role + Logo */}
            <div className="flex min-w-0 flex-[1.5] items-center gap-2 border-r border-border p-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                style={{
                  backgroundColor: row.companyBg,
                  color: row.companyTextColor,
                }}
              >
                {row.companyInitials}
              </div>
              <span className="truncate text-sm font-medium text-foreground">
                {row.role}
              </span>
            </div>

            {/* Company */}
            <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-3">
              <span className="truncate text-sm text-foreground">
                {row.company}
              </span>
            </div>

            {/* Date */}
            <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-3">
              <span className="truncate text-sm text-muted-foreground">
                {row.date}
              </span>
            </div>

            {/* Before */}
            <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-3">
              <span
                className="rounded-full px-2 py-0.5 text-xs leading-[1.33] font-semibold text-primary-foreground"
                style={{ backgroundColor: row.beforeColor }}
              >
                {row.before}
              </span>
            </div>

            {/* After */}
            <div className="flex min-w-0 flex-1 items-center gap-2 p-3">
              <span
                className="rounded-full px-2 py-0.5 text-xs leading-[1.33] font-semibold text-primary-foreground"
                style={{ backgroundColor: row.afterColor }}
              >
                {row.after}
              </span>
            </div>

            {/* Action */}
            <div className="flex w-[100px] shrink-0 items-center justify-center p-3">
              <Button size="xs">
                <Download />
                Baixar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
