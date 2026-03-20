"use client";

import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/utils/style";

export interface PaymentMethodOptionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  loading: boolean;
  selected?: boolean;
  disabled: boolean;
  onSelect: () => void;
}

export function PaymentMethodOption({
  title,
  description,
  icon: Icon,
  loading,
  selected = loading,
  disabled,
  onSelect,
}: PaymentMethodOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border-2 p-6 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        selected
          ? "border-accent-brand bg-accent-brand-light/50 shadow-sm"
          : "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/30"
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-lg",
          selected
            ? "bg-accent-brand text-on-accent-brand"
            : "bg-muted text-muted-foreground"
        )}
      >
        {loading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <Icon className="size-6" />
        )}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-card-title text-foreground">{title}</span>
        <span className="text-small text-muted-foreground">{description}</span>
      </div>
    </button>
  );
}
