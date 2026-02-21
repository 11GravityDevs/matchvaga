import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PAGE_SUBTITLE_CLASS,
  PAGE_TITLE_CLASS,
} from "@/constants/design-tokens";
import Link from "next/link";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName = "Jon" }: DashboardHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-1">
        <h1 className={PAGE_TITLE_CLASS}>Bem-vindo, {userName}!</h1>
        <p className={PAGE_SUBTITLE_CLASS}>
          Aqui está um resumo das suas otimizações.
        </p>
      </div>
      <Link href="/dashboard/new-analysis">
        <Button size="lg" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          Nova Análise
        </Button>
      </Link>
    </div>
  );
}
