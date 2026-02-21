import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName = "Jon" }: DashboardHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between py-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.5px] text-foreground">
          Bem-vindo, {userName}!
        </h1>
        <p className="text-base font-normal text-muted-foreground">
          Aqui está um resumo das suas otimizações.
        </p>
      </div>
      <Button size="lg" className="gap-1.5 shadow-sm">
        <Plus className="h-4 w-4" />
        Nova Análise
      </Button>
    </div>
  );
}
