"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

import { LandingNav } from "./landing-nav";
import { AuthAwareLink } from "./auth-aware-link";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`animate-fade-up fixed inset-x-0 top-0 z-50 flex w-full justify-center border-b py-5 transition-colors duration-300 ease-in-out ${isScrolled ? "border-border bg-white" : "border-transparent bg-background"}`}
    >
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
