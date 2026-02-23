import Link from "next/link";
import { Zap } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ROUTE_DASHBOARD, ROUTE_LOGIN } from "@/constants/routes";

import { LandingNav } from "./landing-nav";

interface LandingHeaderProps {
  isLoggedIn?: boolean;
}

export function LandingHeader({ isLoggedIn = false }: LandingHeaderProps) {
  return (
    <header className="flex w-full justify-center bg-background py-4">
      <div className="mx-auto flex w-full max-w-landing-content items-center justify-between">
        <Logo textClassName="text-xl" />

        <LandingNav />

        <div className="flex items-center gap-3">
          <Button variant="brand" className="gap-2" size="lg" asChild>
            <Link href={isLoggedIn ? ROUTE_DASHBOARD : ROUTE_LOGIN}>
              <Zap className="size-4" />
              {isLoggedIn ? "Acessar Dashboard" : "Começar Grátis"}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
