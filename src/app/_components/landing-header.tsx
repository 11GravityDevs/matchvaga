import { Zap } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

import { LandingNav } from "./landing-nav";
import { AuthAwareLink } from "./auth-aware-link";

export function LandingHeader() {
  return (
    <header className="flex w-full justify-center bg-background py-4">
      <div className="mx-auto flex w-full max-w-landing-content items-center justify-between">
        <Logo textClassName="text-xl" />

        <LandingNav />

        <div className="flex items-center gap-3">
          <Button variant="brand" className="gap-2" size="lg" asChild>
            <AuthAwareLink
              loggedOutLabel="Começar Grátis"
              loggedInLabel="Acessar Dashboard"
              icon={<Zap className="size-4" />}
            />
          </Button>
        </div>
      </div>
    </header>
  );
}
