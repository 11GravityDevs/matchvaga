"use client";

import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAnalyticsEvents } from "@/hooks/use-analytics-events";

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
      <AuthAwareLink
        loggedOutLabel="Começar Grátis"
        loggedInLabel="Acessar Dashboard"
        icon={<Zap className="size-4" />}
      />
    </Button>
  );
}
