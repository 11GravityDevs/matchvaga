"use client";

import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormField } from "@/components/shared/form-field";
import { cn } from "@/utils/style";

const DISPLAY_FORMAT = "MMM yyyy";
const STORAGE_FORMAT = "yyyy-MM-dd";

function parseDateString(value: string): Date | undefined {
  if (!value.trim()) return undefined;
  const iso = parseISO(value);
  if (isValid(iso)) return iso;
  const [year, month] = value.split("-").map(Number);
  if (year && month >= 1 && month <= 12) {
    const d = new Date(year, month - 1, 1);
    return isValid(d) ? d : undefined;
  }
  return undefined;
}

function formatDateForStorage(date: Date): string {
  return format(date, STORAGE_FORMAT);
}

interface DatePickerFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  labelClassName?: string;
  className?: string;
}

export function DatePickerField({
  id,
  label,
  value,
  onChange,
  disabled,
  placeholder = "Selecione a data",
  labelClassName,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const date = parseDateString(value);

  const handleSelect = (selected: Date | undefined) => {
    if (selected) {
      onChange(formatDateForStorage(selected));
      setOpen(false);
    }
  };

  return (
    <FormField
      label={label}
      htmlFor={id}
      labelClassName={labelClassName}
      className={className}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, DISPLAY_FORMAT, { locale: ptBR })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border border-border p-0 ring-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            defaultMonth={date}
            captionLayout="dropdown"
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </FormField>
  );
}
