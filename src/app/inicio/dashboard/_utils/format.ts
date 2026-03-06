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
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const getPart = (type: string): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  const day = getPart("day");
  const month = getPart("month");
  const year = getPart("year");
  const hour = getPart("hour");
  const minute = getPart("minute");

  if (!day || !month || !year || !hour || !minute) {
    return formatter.format(date);
  }

  return `${day}/${month}/${year} - ${hour}:${minute}`;
}
