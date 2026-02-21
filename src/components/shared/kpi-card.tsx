import type { ReactNode } from "react";

import { cn } from "@/utils/style";
import { TEXT_BADGE, TEXT_KPI } from "@/constants/design-tokens";

const KPI_VARIANTS = {
  primary: {
    accent: "bg-accent-brand",
    iconBg: "bg-accent-brand-light",
    icon: "text-accent-brand",
    badge: "bg-accent-brand",
  },
  destructive: {
    accent: "bg-destructive",
    iconBg: "bg-destructive/10",
    icon: "text-destructive",
    badge: "bg-destructive",
  },
  success: {
    accent: "bg-accent-success",
    iconBg: "bg-accent-success/20",
    icon: "text-accent-success",
    badge: "bg-accent-success",
  },
  neutral: {
    accent: "bg-muted-foreground",
    iconBg: "bg-muted",
    icon: "text-muted-foreground",
    badge: "bg-muted-foreground",
  },
} as const;

type KpiVariant = keyof typeof KPI_VARIANTS;

interface KpiCardProps {
  label: string;
  value: string;
  variant?: KpiVariant;
  icon: ReactNode;
  badge?: {
    label: string;
    color?: string;
  };
  /** Optional override for accent/icon/badge when variant is not enough */
  accentColor?: string;
  iconBgColor?: string;
}

export function KpiCard({
  label,
  value,
  variant = "neutral",
  icon,
  badge,
  accentColor,
  iconBgColor,
}: KpiCardProps) {
  const tokens = KPI_VARIANTS[variant];

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Accent bar */}
      <div
        className={cn("h-0.5 w-full", !accentColor && tokens.accent)}
        style={accentColor ? { backgroundColor: accentColor } : undefined}
      />

      {/* Content — p-7 (28px) per design system */}
      <div className="flex items-center justify-between gap-1 p-7">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <div className="flex items-end gap-2">
            <span className={TEXT_KPI}>{value}</span>
            {badge && (
              <span
                className={cn(
                  "mb-0.5 rounded-full px-2 py-0.5 text-primary-foreground",
                  TEXT_BADGE,
                  !badge.color && tokens.badge
                )}
                style={
                  badge.color ? { backgroundColor: badge.color } : undefined
                }
              >
                {badge.label}
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            !iconBgColor && tokens.iconBg
          )}
          style={iconBgColor ? { backgroundColor: iconBgColor } : undefined}
        >
          <span className={cn(!accentColor && tokens.icon)}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
