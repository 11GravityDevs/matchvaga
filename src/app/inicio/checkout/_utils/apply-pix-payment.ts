import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type CheckoutPackageId,
  getCreditsForPackage,
  isCheckoutPackageId,
} from "@/constants/checkout-packages";
import { logServerError } from "@/lib/logger";

export interface ApplyPixPaymentPending {
  user_id: string;
  package_id: string;
}

export async function applyPixPayment(
  supabase: SupabaseClient,
  chargeId: string,
  pending: ApplyPixPaymentPending
): Promise<{ success: boolean; error?: string }> {
  try {
    const packageId = pending.package_id;
    if (!isCheckoutPackageId(packageId)) {
      logServerError({
        context: "server_action",
        operation: "applyPixPayment",
        message: "Invalid package id in pending PIX charge",
        errorMessage: packageId,
      });
      return { success: false, error: "Invalid package id" };
    }

    const creditsToGrant = getCreditsForPackage(packageId as CheckoutPackageId);

    const { error: purchaseInsertError } = await supabase
      .from("purchases")
      .insert({
        payment_provider: "abacatepay",
        external_id: chargeId,
        user_id: pending.user_id,
        package_id: packageId,
        credits_granted: creditsToGrant,
      });

    if (purchaseInsertError) {
      if (purchaseInsertError.code === "23505") {
        return { success: true };
      }
      logServerError({
        context: "server_action",
        operation: "applyPixPayment",
        message: purchaseInsertError.message,
      });
      return { success: false, error: "Database error" };
    }

    const { data: currentCreditsRow, error: creditsSelectError } =
      await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", pending.user_id)
        .maybeSingle();

    if (creditsSelectError) {
      logServerError({
        context: "server_action",
        operation: "applyPixPayment",
        message: creditsSelectError.message,
      });
      return { success: false, error: "Database error" };
    }

    const newCreditsTotal =
      ((currentCreditsRow?.credits as number | null | undefined) ?? 0) +
      creditsToGrant;

    const { error: creditsUpsertError } = await supabase
      .from("user_credits")
      .upsert(
        {
          user_id: pending.user_id,
          credits: newCreditsTotal,
        },
        { onConflict: "user_id" }
      );

    if (creditsUpsertError) {
      logServerError({
        context: "server_action",
        operation: "applyPixPayment",
        message: creditsUpsertError.message,
      });
      return { success: false, error: "Database error" };
    }

    const { error: pendingDeleteError } = await supabase
      .from("pix_pending_charges")
      .delete()
      .eq("charge_id", chargeId);

    if (pendingDeleteError) {
      logServerError({
        context: "server_action",
        operation: "applyPixPayment",
        message: pendingDeleteError.message,
      });
      return { success: false, error: "Database error" };
    }

    return { success: true };
  } catch (err) {
    logServerError(
      {
        context: "server_action",
        operation: "applyPixPayment",
        message: "Unexpected error applying PIX payment",
      },
      err
    );
    return { success: false, error: "Server error" };
  }
}
