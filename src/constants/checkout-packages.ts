export const CHECKOUT_PACKAGE_IDS = [
  "avulso",
  "entrada",
  "basico",
  "padrao",
  "profissional",
] as const;

export type CheckoutPackageId = (typeof CHECKOUT_PACKAGE_IDS)[number];

const PACKAGE_PRICE_CENTAVOS: Record<CheckoutPackageId, number> = {
  avulso: 290, // R$ 2,90
  entrada: 590, // R$ 5,90
  basico: 1490, // R$ 14,90
  padrao: 2990, // R$ 29,90
  profissional: 4990, // R$ 49,90
};

const PACKAGE_NAMES: Record<CheckoutPackageId, string> = {
  avulso: "Avulso",
  entrada: "Entrada",
  basico: "Básico",
  padrao: "Padrão",
  profissional: "Profissional",
};

const PACKAGE_CREDITS: Record<CheckoutPackageId, number> = {
  avulso: 1,
  entrada: 3,
  basico: 10,
  padrao: 25,
  profissional: 50,
};

export function getPackagePriceCentavos(packageId: CheckoutPackageId): number {
  return PACKAGE_PRICE_CENTAVOS[packageId];
}

export function getPackageName(packageId: CheckoutPackageId): string {
  return PACKAGE_NAMES[packageId];
}

export function getCreditsForPackage(packageId: CheckoutPackageId): number {
  return PACKAGE_CREDITS[packageId];
}

export function isCheckoutPackageId(id: string): id is CheckoutPackageId {
  return CHECKOUT_PACKAGE_IDS.includes(id as CheckoutPackageId);
}
