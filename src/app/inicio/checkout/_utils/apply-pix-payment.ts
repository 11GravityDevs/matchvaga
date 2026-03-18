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

const CREDITS_UPDATE_MAX_ATTEMPTS = 2;

async function applyCreditsAtomically(
  supabase: SupabaseClient,
  userId: string,
  creditsToGrant: number
): Promise<boolean> {
  for (let attempt = 0; attempt < CREDITS_UPDATE_MAX_ATTEMPTS; attempt++) {
    const { data: currentRow, error: selectError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

    if (selectError) {
      logServerError({
        context: "server_action",
        operation: "applyPixPayment",
        message: selectError.message,
      });
      return false;
    }

    const currentCredits =
      (currentRow?.credits as number | null | undefined) ?? 0;
    const newCreditsTotal = currentCredits + creditsToGrant;

    if (currentRow === null) {
      const { error: insertError } = await supabase
        .from("user_credits")
        .insert({ user_id: userId, credits: creditsToGrant });

      if (!insertError) return true;
      if (insertError.code === "23505") continue;
      logServerError({
        context: "server_action",
        operation: "applyPixPayment",
        message: insertError.message,
      });
      return false;
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from("user_credits")
      .update({ credits: newCreditsTotal })
      .eq("user_id", userId)
      .eq("credits", currentCredits)
      .select("credits")
      .maybeSingle();

    if (!updateError && updatedRow != null) return true;
    if (updateError) {
      logServerError({
        context: "server_action",
        operation: "applyPixPayment",
        message: updateError.message,
      });
      return false;
    }
  }

  logServerError({
    context: "server_action",
    operation: "applyPixPayment",
    message: "Credits update failed after optimistic lock retries",
  });
  return false;
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

    const creditsApplied = await applyCreditsAtomically(
      supabase,
      pending.user_id,
      creditsToGrant
    );
    if (!creditsApplied) {
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
