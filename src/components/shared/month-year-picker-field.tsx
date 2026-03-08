"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormField } from "@/components/shared/form-field";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";
import { cn } from "@/utils/style";

const MONTHS_PT_BR = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
] as const;

function parseMonthYear(value: string): { month: number; year: number } | null {
  if (!value.trim()) return null;
  const parts = value.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  if (!year || !month || month < 1 || month > 12) return null;
  return { month, year };
}

function formatDisplay(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, "MMM yyyy", { locale: ptBR });
}

function buildValue(month: number, year: number): string {
  const m = String(month).padStart(2, "0");
  return `${year}-${m}`;
}

function getYearOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  const years: { value: string; label: string }[] = [];
  for (let y = currentYear + 1; y >= currentYear - 50; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

interface MonthYearPickerFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  labelClassName?: string;
  className?: string;
  error?: string;
}

export function MonthYearPickerField({
  id,
  label,
  value,
  onChange,
  disabled,
  placeholder = "Selecione mês e ano",
  labelClassName,
  className,
  error,
}: MonthYearPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseMonthYear(value);

  const yearOptions = useMemo(() => getYearOptions(), []);

  const displayText = parsed ? formatDisplay(parsed.month, parsed.year) : null;

  const handleMonthChange = (monthStr: string) => {
    const month = Number(monthStr);
    const year = parsed?.year ?? new Date().getFullYear();
    onChange(buildValue(month, year));
    setOpen(false);
  };

  const handleYearChange = (yearStr: string) => {
    const year = Number(yearStr);
    const month = parsed?.month ?? 1;
    onChange(buildValue(month, year));
    setOpen(false);
  };

  return (
    <FormField
      label={label}
      htmlFor={id}
      labelClassName={labelClassName}
      className={className}
      error={error}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              "h-9 w-full justify-start text-left font-normal focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30",
              !displayText && "text-muted-foreground",
              error && "border-destructive! ring-1! ring-destructive/30!"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText ?? <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border border-border p-3 ring-0"
          align="start"
        >
          <div className="flex gap-2">
            <Select
              value={parsed ? String(parsed.month) : ""}
              onValueChange={handleMonthChange}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(INPUT_CLASS, "w-full min-w-32")}
                aria-label="Mês"
              >
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS_PT_BR.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={parsed ? String(parsed.year) : ""}
              onValueChange={handleYearChange}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(INPUT_CLASS, "w-full min-w-24")}
                aria-label="Ano"
              >
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </FormField>
  );
}
