"use client";

import { cn } from "@/utils/style";

const NAV_LINKS = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface LandingNavProps {
  className?: string;
}

export function LandingNav({ className }: LandingNavProps) {
  return (
    <nav
      className={cn("flex items-center gap-8", className)}
      aria-label="Navegação principal"
    >
      {NAV_LINKS.map((link) => {
        const sectionId = link.href.replace("#", "");
        return (
          <button
            key={link.href}
            type="button"
            onClick={() => scrollToSection(sectionId)}
            className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-accent-brand"
          >
            {link.label}
          </button>
        );
      })}
    </nav>
  );
}
