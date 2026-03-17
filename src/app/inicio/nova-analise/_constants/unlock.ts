import type { CheckoutPackageId } from "@/constants/checkout-packages";

export const UNLOCK_RETRY_DELAY_MS = 3000;
export const UNLOCK_MAX_RETRIES = 5;

export const UNLOCK_PACKAGE_ID: CheckoutPackageId = "avulso";

export const UNLOCK_ERROR_MAX_RETRIES =
  "Não foi possível desbloquear automaticamente. Recarregue a página e tente novamente.";
