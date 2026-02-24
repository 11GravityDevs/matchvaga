"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Zap,
  Search,
  ChevronsUpDown,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  ROUTE_DASHBOARD,
  ROUTE_DASHBOARD_NEW_ANALYSIS,
  ROUTE_DASHBOARD_RESUME,
} from "@/constants/routes";
import { cn } from "@/utils/style";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Nova Análise",
    href: ROUTE_DASHBOARD_NEW_ANALYSIS,
    icon: Search,
  },
  { label: "Dashboard", href: ROUTE_DASHBOARD, icon: LayoutDashboard },
  { label: "Meu Currículo", href: ROUTE_DASHBOARD_RESUME, icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-sidebar shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-2">
      {/* Brand */}
      <div className="px-2 py-3">
        <Logo textClassName="text-sidebar-foreground" />
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col gap-1 px-1">
        <p className="px-2 py-2 text-caption-leading font-medium tracking-wide text-muted-foreground uppercase">
          MENU
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-l-2 border-accent-brand bg-accent-brand-light pl-1.5 font-semibold text-accent-brand"
                  : "font-normal text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-accent-brand" : "text-muted-foreground"
                  )}
                />
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Pro Upgrade Card */}
        <div className="mt-auto rounded-xl bg-accent-brand p-4">
          <div className="flex flex-col gap-3">
            <Zap className="h-6 w-6 text-primary-foreground" />
            <p className="text-sm font-semibold text-primary-foreground">
              Upgrade para Pro
            </p>
            <p className="text-xs font-normal text-primary-foreground">
              Desbloqueie análises ilimitadas e recursos avançados.
            </p>
            <Button
              variant="secondary"
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 rounded-md bg-sidebar p-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted">
            <span className="text-sm font-semibold text-foreground">JD</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm leading-snug font-medium text-sidebar-foreground">
              Jon Doe
            </span>
            <span className="text-xs leading-relaxed text-sidebar-foreground">
              joe@acmecorp.com
            </span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </aside>
  );
}
