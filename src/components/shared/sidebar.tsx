"use client";

import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Zap,
  Search,
  ChevronsUpDown,
  LogOut,
  Moon,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ROUTE_DASHBOARD,
  ROUTE_DASHBOARD_NEW_ANALYSIS,
  ROUTE_DASHBOARD_RESUME,
} from "@/constants/routes";
import { useSignOut } from "@/hooks/use-sign-out";
import { resumeQueryOptions } from "@/lib/query/query-options";
import { cn } from "@/utils/style";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
  const { data: resumeResult } = useQuery(resumeQueryOptions);
  const { signOut, isPending } = useSignOut();

  const resumeData = resumeResult?.data;
  const displayName = resumeData?.fullName?.split(" ")[0] ?? "Usuário";
  const email = resumeData?.email ?? "—";
  const initials = resumeData?.fullName
    ? getInitials(resumeData.fullName)
    : "?";

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild aria-label="Abrir menu da conta">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-sidebar p-2 transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted">
                <span className="text-sm font-semibold text-foreground">
                  {initials}
                </span>
              </div>
              <div className="flex flex-col justify-center text-left">
                <span className="text-sm leading-snug font-medium text-sidebar-foreground">
                  {displayName}
                </span>
                <span className="text-xs leading-relaxed text-sidebar-foreground">
                  {email}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuItem
            disabled
            className="cursor-pointer text-muted-foreground"
          >
            <Moon className="h-4 w-4" />
            Modo escuro (em breve)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault();
              void signOut();
            }}
            disabled={isPending}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
