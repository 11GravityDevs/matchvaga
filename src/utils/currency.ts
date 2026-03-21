const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCentavosToBrl(amountCentavos: number): string {
  return brlFormatter.format(amountCentavos / 100);
}
