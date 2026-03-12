export function formatJobRoleLabel(
  title: string | null | undefined,
  company: string | null | undefined
): string {
  return title && company
    ? `${title} - ${company}`
    : (title ?? company ?? "Vaga");
}
