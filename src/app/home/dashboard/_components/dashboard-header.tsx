import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTE_HOME_NEW_ANALYSIS } from "@/constants/routes";
import Link from "next/link";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({
  userName = "Usuário",
}: DashboardHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title">Bem-vindo, {userName}!</h1>
        <p className="text-page-subtitle">
          Aqui está um resumo das suas otimizações.
        </p>
      </div>
      <Link href={ROUTE_HOME_NEW_ANALYSIS}>
        <Button size="lg" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nova Análise
        </Button>
      </Link>
    </div>
  );
}
