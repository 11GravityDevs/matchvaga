"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useAnalyticsEvents } from "@/hooks/useAnalyticsEvents";

import { AuthAwareLink } from "./auth-aware-link";
import { LandingNav } from "./landing-nav";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { trackLandingNavbarCtaClicked } = useAnalyticsEvents();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`animate-fade-up relative inset-x-0 top-0 z-50 flex w-full justify-center border-b py-5 transition-colors duration-300 ease-in-out lg:fixed ${isScrolled ? "border-border bg-white" : "border-transparent bg-background"}`}
    >
      <div className="mx-4 flex w-full max-w-landing-content items-center justify-between sm:mx-8 xl:mx-auto">
        <Logo textClassName="text-xl" />

        <LandingNav className="hidden md:flex" />

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="brand"
            className="gap-2"
            size="lg"
            asChild
            onClick={trackLandingNavbarCtaClicked}
          >
            <AuthAwareLink
              loggedOutHref="/em-breve"
              loggedInHref="/em-breve"
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
