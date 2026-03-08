"use client";

import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAnalyticsEvents } from "@/hooks/use-analytics-events";

import { AuthAwareLink } from "./auth-aware-link";

export function FinalCtaButton() {
  const { trackLandingFinalCtaClicked } = useAnalyticsEvents();

  return (
    <Button
      variant="brand"
      className="gap-2 bg-white px-8 py-6 hover:bg-white/90"
      asChild
      onClick={trackLandingFinalCtaClicked}
    >
      {/* TODO(lancamento): restaurar navegação para login/dashboard em vez de /em-breve */}
      <AuthAwareLink
        loggedOutLabel="Começar Grátis"
        loggedInLabel="Acessar Dashboard"
        loggedOutHref="/em-breve"
        loggedInHref="/em-breve"
        icon={<Zap className="size-4.5 text-accent-brand" />}
        className="flex items-center gap-2"
        labelClassName="text-base font-semibold text-accent-brand"
      />
    </Button>
  );
}
