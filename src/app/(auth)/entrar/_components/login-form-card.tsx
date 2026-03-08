import Link from "next/link";

import { Logo } from "@/components/shared/logo";
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
        "flex w-full flex-col items-center justify-center bg-background px-12 py-0 md:w-1/2",
        className
      )}
    >
      <div className="flex w-full max-w-login-form flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-3">
          <Logo
            iconContainerClassName="h-12 w-12 rounded-xl"
            iconClassName="h-6 w-6"
            textClassName="text-2xl font-bold tracking-[-0.5px]"
          />
          <span className="text-sm font-normal text-muted-foreground">
            Otimização Inteligente de Currículos
          </span>
        </div>

        <Card className="w-full rounded-xl border border-border">
          <CardHeader className="gap-1 pb-0">
            <CardTitle className="text-card-title">{title}</CardTitle>
            <CardDescription className="text-card-description">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 pt-6">
            {children}
          </CardContent>
        </Card>

        <p className="max-w-hero-desc text-center text-xs font-normal text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <Link
            href="/termos-de-servico"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
          >
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link
            href="/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
          >
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
