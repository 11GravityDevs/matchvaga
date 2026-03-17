import { NextResponse } from "next/server";

import {
  type CheckoutPackageId,
  getCreditsForPackage,
  isCheckoutPackageId,
} from "@/constants/checkout-packages";
import { logServerError } from "@/lib/logger";
import { createAdminSupabaseClient } from "@/lib/supabase/service";

import type { AbacatePayWebhookPayload } from "./verify-webhook";

function extractPixChargeId(
  payload: AbacatePayWebhookPayload
): string | undefined {
  const data = payload.data ?? {};
  const candidates = [
    data["id"],
    (data["pix"] as Record<string, unknown> | undefined)?.["id"],
    (data["pixQrCode"] as Record<string, unknown> | undefined)?.["id"],
    (data["charge"] as Record<string, unknown> | undefined)?.["id"],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return undefined;
}

export async function handlePaymentPaid(
  payload: AbacatePayWebhookPayload
): Promise<NextResponse | null> {
  const chargeId = extractPixChargeId(payload);
  if (!chargeId) return null;

  try {
    const supabase = createAdminSupabaseClient();
    const { data: pendingCharge, error: pendingChargeError } = await supabase
      .from("pix_pending_charges")
      .select("user_id, package_id")
      .eq("charge_id", chargeId)
      .maybeSingle();

    if (pendingChargeError) {
      logServerError({
        context: "api",
        operation: "abacatepay_webhook_pending_select",
        message: pendingChargeError.message,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    if (!pendingCharge) return null;

    const packageId = pendingCharge.package_id;
    if (!isCheckoutPackageId(packageId)) {
      logServerError({
        context: "api",
        operation: "abacatepay_webhook",
        message: "Invalid package id in pending PIX charge",
        errorMessage: packageId,
      });
      return null;
    }

    const creditsToGrant = getCreditsForPackage(packageId as CheckoutPackageId);

    const { error: purchaseInsertError } = await supabase
      .from("purchases")
      .insert({
        payment_provider: "abacatepay",
        external_id: chargeId,
        user_id: pendingCharge.user_id,
        package_id: packageId,
        credits_granted: creditsToGrant,
      });

    if (purchaseInsertError) {
      if (purchaseInsertError.code === "23505") return null;
      logServerError({
        context: "api",
        operation: "abacatepay_webhook_purchase_insert",
        message: purchaseInsertError.message,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    const { data: currentCreditsRow, error: creditsSelectError } =
      await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", pendingCharge.user_id)
        .maybeSingle();

    if (creditsSelectError) {
      logServerError({
        context: "api",
        operation: "abacatepay_webhook_credits_select",
        message: creditsSelectError.message,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    const newCreditsTotal =
      ((currentCreditsRow?.credits as number | null | undefined) ?? 0) +
      creditsToGrant;

    const { error: creditsUpsertError } = await supabase
      .from("user_credits")
      .upsert(
        {
          user_id: pendingCharge.user_id,
          credits: newCreditsTotal,
        },
        { onConflict: "user_id" }
      );

    if (creditsUpsertError) {
      logServerError({
        context: "api",
        operation: "abacatepay_webhook_credits_upsert",
        message: creditsUpsertError.message,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    const { error: pendingDeleteError } = await supabase
      .from("pix_pending_charges")
      .delete()
      .eq("charge_id", chargeId);

    if (pendingDeleteError) {
      logServerError({
        context: "api",
        operation: "abacatepay_webhook_pending_delete",
        message: pendingDeleteError.message,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    return null;
  } catch (err) {
    logServerError(
      {
        context: "api",
        operation: "abacatepay_webhook",
        message: "Unexpected error processing webhook",
      },
      err
    );
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
