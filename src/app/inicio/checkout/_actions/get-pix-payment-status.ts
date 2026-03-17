"use server";

import { z } from "zod";

import { getAbacatePixChargeStatus } from "@/lib/abacatepay/client";
import { logServerError } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/supabase/server";

import { applyPixPayment } from "../_utils/apply-pix-payment";

const getPixPaymentStatusSchema = z.object({
  paymentId: z.string().min(1, "Pagamento inválido."),
});

type PixPaymentStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cancelled"
  | "refunded";

export interface GetPixPaymentStatusResult {
  success: boolean;
  status?: PixPaymentStatus;
  expiresAt?: string;
  error?: string;
}

function normalizeStatus(status?: string): PixPaymentStatus | undefined {
  switch (status) {
    case "PAID":
      return "paid";
    case "EXPIRED":
      return "expired";
    case "CANCELLED":
      return "cancelled";
    case "REFUNDED":
      return "refunded";
    case "PENDING":
      return "pending";
    default:
      return undefined;
  }
}

export async function getPixPaymentStatus(input: {
  paymentId: string;
}): Promise<GetPixPaymentStatusResult> {
  const parsed = getPixPaymentStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Pagamento inválido." };
  }

  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const paymentId = parsed.data.paymentId;

  const { data: purchaseRow, error: purchaseSelectError } = await auth.supabase
    .from("purchases")
    .select("id")
    .eq("payment_provider", "abacatepay")
    .eq("external_id", paymentId)
    .maybeSingle();

  if (purchaseSelectError) {
    logServerError({
      context: "server_action",
      operation: "getPixPaymentStatus",
      action: "getPixPaymentStatus",
      message: purchaseSelectError.message,
    });
    return { success: false, error: "Não foi possível verificar o pagamento." };
  }

  if (purchaseRow) {
    return { success: true, status: "paid" };
  }

  const { data: pendingCharge, error: pendingSelectError } = await auth.supabase
    .from("pix_pending_charges")
    .select("charge_id, user_id, package_id")
    .eq("charge_id", paymentId)
    .maybeSingle();

  if (pendingSelectError) {
    logServerError({
      context: "server_action",
      operation: "getPixPaymentStatus",
      action: "getPixPaymentStatus",
      message: pendingSelectError.message,
    });
    return { success: false, error: "Não foi possível verificar o pagamento." };
  }

  if (!pendingCharge) {
    return { success: false, error: "Pagamento não encontrado." };
  }

  try {
    const statusResult = await getAbacatePixChargeStatus(paymentId);
    if (statusResult.error || !statusResult.data) {
      return {
        success: false,
        error: "Não foi possível verificar o pagamento.",
      };
    }

    const normalizedStatus = normalizeStatus(statusResult.data.status);

    if (!normalizedStatus) {
      return { success: false, error: "Status de pagamento inválido." };
    }

    if (normalizedStatus === "paid") {
      const applyResult = await applyPixPayment(auth.supabase, paymentId, {
        user_id: pendingCharge.user_id,
        package_id: pendingCharge.package_id,
      });
      if (!applyResult.success) {
        logServerError({
          context: "server_action",
          operation: "getPixPaymentStatus",
          action: "getPixPaymentStatus",
          message: "Failed to apply pix payment",
          errorMessage: applyResult.error,
        });
        return {
          success: false,
          error: "Erro ao processar a confirmação do pagamento.",
        };
      }
    }

    return {
      success: true,
      status: normalizedStatus,
      expiresAt: statusResult.data.expiresAt,
    };
  } catch (err) {
    logServerError(
      {
        context: "server_action",
        operation: "getPixPaymentStatus",
        action: "getPixPaymentStatus",
        message: "Unexpected error checking PIX status",
      },
      err
    );

    return { success: false, error: "Não foi possível verificar o pagamento." };
  }
}
