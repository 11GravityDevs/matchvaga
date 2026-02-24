"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type FilterType = "todos" | "recentes" | "score-alto";

export interface AnalysisTableRow {
  analysisId: string;
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
  rows: AnalysisTableRow[];
  activeFilter?: FilterType;
  onDownload?: (
    analysisId: string,
    format: "pdf" | "docx"
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
}

const filters: { label: string; value: FilterType }[] = [
  { label: "Todos", value: "todos" },
  { label: "Recentes", value: "recentes" },
  { label: "Score Alto", value: "score-alto" },
];

export function AnalysisHistoryTable({
  rows,
  activeFilter = "todos",
  onDownload,
}: AnalysisHistoryTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (analysisId: string, format: "pdf" | "docx") => {
    if (!onDownload) return;
    setDownloadingId(analysisId);
    try {
      const result = await onDownload(analysisId, format);
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Section Header - outside card */}
      <div className="flex w-full items-center justify-between">
        <h2 className="text-section-header">Histórico de Análises</h2>
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
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        {/* Header Row */}
        <div className="flex w-full items-center border-b border-border bg-muted/50">
          <div className="flex min-w-0 flex-[1.5] items-center gap-2 border-b-0 table-cell-padding">
            <span className="truncate text-sm leading-snug text-muted-foreground">
              Cargo
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 p-4">
            <span className="truncate text-sm leading-snug text-muted-foreground">
              Empresa
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 p-4">
            <span className="truncate text-sm leading-snug text-muted-foreground">
              Data
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 p-4">
            <span className="truncate text-sm leading-snug text-muted-foreground">
              Antes
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 p-4">
            <span className="truncate text-sm leading-snug text-muted-foreground">
              Depois
            </span>
          </div>
          <div className="flex w-action shrink-0 p-4" />
        </div>

        {/* Data Rows */}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma análise ainda. Crie uma nova análise para começar.
            </p>
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.analysisId}
              className="flex w-full items-center border-b border-border last:border-b-0"
            >
              {/* Role + Logo */}
              <div className="flex min-w-0 flex-[1.5] items-center gap-2 border-r border-border p-4">
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
              <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-4">
                <span className="truncate text-sm text-foreground">
                  {row.company}
                </span>
              </div>

              {/* Date */}
              <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-4">
                <span className="truncate text-sm text-muted-foreground">
                  {row.date}
                </span>
              </div>

              {/* Before */}
              <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-4">
                <span
                  className="rounded-full px-2 py-0.5 text-caption-leading font-semibold text-on-accent-brand"
                  style={{ backgroundColor: row.beforeColor }}
                >
                  {row.before}
                </span>
              </div>

              {/* After */}
              <div className="flex min-w-0 flex-1 items-center gap-2 p-4">
                <span
                  className="rounded-full px-2 py-0.5 text-caption-leading font-semibold text-on-accent-brand"
                  style={{ backgroundColor: row.afterColor }}
                >
                  {row.after}
                </span>
              </div>

              {/* Action */}
              <div className="flex w-action shrink-0 items-center justify-center p-4">
                <Button
                  size="xs"
                  className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
                  variant="ghost"
                  disabled={!onDownload || downloadingId === row.analysisId}
                  onClick={() => handleDownload(row.analysisId, "pdf")}
                >
                  <Download className="h-4 w-4" />
                  {downloadingId === row.analysisId ? "..." : "Baixar"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
