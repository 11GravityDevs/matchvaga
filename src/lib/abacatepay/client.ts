import { logServerError } from "@/lib/logger";

const ABACATEPAY_BASE_URL = "https://api.abacatepay.com/v1";

type AbacatePayResponse<TData> = {
  data: TData | null;
  error: string | null;
};

export interface CreatePixChargeInput {
  amount: number;
  expiresIn?: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePixChargeData {
  id: string;
  status: "PENDING" | "EXPIRED" | "CANCELLED" | "PAID" | "REFUNDED";
  brCode: string;
  brCodeBase64: string;
  expiresAt?: string;
}

export interface PixChargeStatusData {
  status: "PENDING" | "EXPIRED" | "CANCELLED" | "PAID" | "REFUNDED";
  expiresAt?: string;
}

function getAbacatePayApiKey(): string {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("ABACATEPAY_API_KEY is not set");
  }
  return apiKey;
}

async function requestAbacatePay<TData>(
  path: string,
  init?: RequestInit
): Promise<AbacatePayResponse<TData>> {
  const apiKey = getAbacatePayApiKey();
  const response = await fetch(`${ABACATEPAY_BASE_URL}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const rawBody = await response.text();
    logServerError({
      context: "server_action",
      operation: "abacatepay_request",
      message: `AbacatePay API returned status ${response.status}`,
      errorMessage: rawBody,
    });
    return { data: null, error: "Erro ao comunicar com o pagamento." };
  }

  return (await response.json()) as AbacatePayResponse<TData>;
}

export async function createAbacatePixCharge(
  input: CreatePixChargeInput
): Promise<AbacatePayResponse<CreatePixChargeData>> {
  return requestAbacatePay<CreatePixChargeData>("/pixQrCode/create", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function getAbacatePixChargeStatus(
  chargeId: string
): Promise<AbacatePayResponse<PixChargeStatusData>> {
  const encodedId = encodeURIComponent(chargeId);
  return requestAbacatePay<PixChargeStatusData>(
    `/pixQrCode/check?id=${encodedId}`
  );
}
