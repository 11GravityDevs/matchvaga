"use client";

import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAnalyticsEvents } from "@/hooks/useAnalyticsEvents";

import { AuthAwareLink } from "./auth-aware-link";

export function HeroPrimaryCtaButton() {
  const { trackLandingHeroPrimaryCtaClicked } = useAnalyticsEvents();

  return (
    <Button
      variant="brand"
      className="gap-2"
      size="brand"
      asChild
      onClick={trackLandingHeroPrimaryCtaClicked}
    >
      {/* TODO(lancamento): restaurar navegação para login/dashboard em vez de /em-breve */}
      <AuthAwareLink
        loggedOutLabel="Começar Grátis"
        loggedInLabel="Acessar Dashboard"
        loggedOutHref="/em-breve"
        loggedInHref="/em-breve"
        icon={<Zap className="size-4" />}
      />
    </Button>
  );
}
