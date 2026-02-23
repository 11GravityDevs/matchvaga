const COMPANY_COLORS = [
  { bg: "var(--accent-brand)", text: "var(--primary-foreground)" },
  { bg: "var(--destructive)", text: "var(--primary-foreground)" },
  { bg: "var(--accent-warning)", text: "var(--accent-warning-text)" },
  { bg: "var(--accent-success)", text: "var(--primary-foreground)" },
] as const;

export function getCompanyInitials(company: string): string {
  const trimmed = company.trim();
  if (!trimmed) return "—";

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const first = words[0][0] ?? "";
    const second = words[1][0] ?? "";
    return (first + second).toUpperCase().slice(0, 2);
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function getCompanyColor(company: string): {
  bg: string;
  text: string;
} {
  const hash = company.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const index = Math.abs(hash) % COMPANY_COLORS.length;
  return COMPANY_COLORS[index];
}

export function formatAnalysisDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
