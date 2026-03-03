"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, File, FileText, Loader2, Play } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QUERY_CONTINUE_ANALYSIS,
  ROUTE_HOME_NEW_ANALYSIS,
} from "@/constants/routes";
import { cn } from "@/utils/style";

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
  status: string;
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

const STATUS_LABEL_PT_BR: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluído",
  abandoned: "Abandonado",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending:
    "border-accent-warning-border bg-accent-warning-light text-accent-warning-text",
  completed:
    "border-accent-success-border bg-accent-success-light text-accent-success-text",
  abandoned:
    "border-accent-low-border bg-accent-low-light text-accent-low-text",
};

function getStatusLabel(status: string): string {
  return STATUS_LABEL_PT_BR[status] ?? status;
}

function getStatusBadgeClass(status: string): string {
  return (
    STATUS_BADGE_CLASSES[status] ??
    "border-border bg-muted text-muted-foreground"
  );
}

export function AnalysisHistoryTable({
  rows,
  activeFilter = "todos",
  onDownload,
}: AnalysisHistoryTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [openAnalysisId, setOpenAnalysisId] = useState<string | null>(null);

  const handleDownload = async (analysisId: string, format: "pdf" | "docx") => {
    if (!onDownload) return;
    setDownloadingId(analysisId);
    try {
      const result = await onDownload(analysisId, format);
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      }
      setOpenAnalysisId(null);
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
          <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-4">
            <span className="truncate text-sm leading-snug text-muted-foreground">
              Status
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
              <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-4">
                {row.after === "—" ? (
                  <span className="text-caption-leading text-muted-foreground">
                    {row.after}
                  </span>
                ) : (
                  <span
                    className="rounded-full px-2 py-0.5 text-caption-leading font-semibold text-on-accent-brand"
                    style={{ backgroundColor: row.afterColor }}
                  >
                    {row.after}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-border p-4">
                <Badge
                  variant="outline"
                  className={cn(
                    "max-w-full truncate text-xs font-semibold",
                    getStatusBadgeClass(row.status)
                  )}
                >
                  {getStatusLabel(row.status)}
                </Badge>
              </div>

              {/* Action */}
              <div className="flex w-action shrink-0 items-center justify-center gap-1 p-4">
                {row.status === "pending" ? (
                  <Button
                    size="icon"
                    className="text-accent-brand hover:text-accent-brand-hover [&_svg]:size-5"
                    variant="ghost"
                    title="Continuar"
                  >
                    <Link
                      href={`${ROUTE_HOME_NEW_ANALYSIS}?${QUERY_CONTINUE_ANALYSIS}=${row.analysisId}`}
                    >
                      <Play className="size-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    className="text-accent-brand hover:text-accent-brand-hover [&_svg]:size-5"
                    variant="ghost"
                    disabled={!onDownload || downloadingId === row.analysisId}
                    onClick={() => setOpenAnalysisId(row.analysisId)}
                    aria-haspopup="dialog"
                    aria-expanded={openAnalysisId === row.analysisId}
                    title="Baixar"
                  >
                    {downloadingId === row.analysisId ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Download className="size-5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={openAnalysisId !== null}
        onOpenChange={(open) => !open && setOpenAnalysisId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Baixar documento</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3 sm:justify-center">
            <Button
              size="brand"
              variant="outline"
              className="gap-1.5"
              disabled={!openAnalysisId || downloadingId === openAnalysisId}
              onClick={() =>
                openAnalysisId && handleDownload(openAnalysisId, "docx")
              }
            >
              <FileText className="h-4 w-4" />
              Baixar DOCX
            </Button>

            <Button
              size="brand"
              variant="brand"
              className="gap-1.5"
              disabled={!openAnalysisId || downloadingId === openAnalysisId}
              onClick={() =>
                openAnalysisId && handleDownload(openAnalysisId, "pdf")
              }
            >
              <File className="h-4 w-4" />
              Baixar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
