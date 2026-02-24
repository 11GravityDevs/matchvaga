import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const LEGAL_LINKS = [
  { label: "Termos de Serviço", href: "/termos-de-servico" },
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
] as const;

export function LandingFooter() {
  return (
    <footer className="w-full bg-footer-bg py-12">
      <div className="mx-auto flex w-full max-w-landing-content flex-col items-center justify-center gap-10">
        <Logo variant="light" textClassName="text-lg font-bold" />

        <nav
          className="flex flex-wrap items-center justify-center gap-6"
          aria-label="Links legais"
        >
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md px-3 py-2 text-small text-footer-muted transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer-bg focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-6">
          <span className="text-center text-small text-footer-muted-subtle">
            © 2026 MatchVaga. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
