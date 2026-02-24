"use client";

import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AuthAwareLink } from "./auth-aware-link";

const NAV_LINKS = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
] as const;

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface LandingMobileNavProps {
  onLinkClick: () => void;
}

export function LandingMobileNav({ onLinkClick }: LandingMobileNavProps) {
  const handleLinkClick = (sectionId: string) => {
    scrollToSection(sectionId);
    onLinkClick();
  };

  return (
    <div className="flex flex-col gap-8 pt-12">
      <nav className="flex flex-col gap-6" aria-label="Navegação mobile">
        {NAV_LINKS.map((link) => {
          const sectionId = link.href.replace("#", "");
          return (
            <button
              key={link.href}
              type="button"
              onClick={() => handleLinkClick(sectionId)}
              className="cursor-pointer text-left text-base font-medium text-foreground transition-colors hover:text-accent-brand"
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      <Button variant="brand" className="w-full gap-2 py-3.5" size="lg" asChild>
        <AuthAwareLink
          loggedOutLabel="Começar Grátis"
          loggedInLabel="Acessar Dashboard"
          icon={<Zap className="size-4" />}
        />
      </Button>
    </div>
  );
}
