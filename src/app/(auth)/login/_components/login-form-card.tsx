import { FileSearch } from "lucide-react";
import Link from "next/link";

import { BrandName } from "@/components/shared/brand-name";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/style";

interface LoginFormCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function LoginFormCard({
  title,
  description,
  children,
  className,
}: LoginFormCardProps) {
  return (
    <div
      className={cn(
        "flex w-1/2 flex-col items-center justify-center bg-background px-12 py-0",
        className
      )}
    >
      <div className="flex w-full max-w-[400px] flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-brand">
            <FileSearch className="h-6 w-6 text-white" />
          </div>
          <BrandName className="text-2xl font-bold tracking-[-0.5px]" />
          <span className="text-sm font-normal text-muted-foreground">
            Otimização Inteligente de Currículos
          </span>
        </div>

        <Card className="w-full rounded-xl border border-border shadow-xs">
          <CardHeader className="gap-1 pb-0">
            <CardTitle className="text-[22px] leading-[1.3] font-bold text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-[1.4]">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 pt-6">
            {children}
          </CardContent>
        </Card>

        <p className="max-w-[340px] text-center text-xs font-normal text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <Link
            href="/termos-de-servico"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link
            href="/politica-de-privacidade"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
