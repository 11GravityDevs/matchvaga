import { NextResponse } from "next/server";
import Stripe from "stripe";

import {
  type CheckoutPackageId,
  getCreditsForPackage,
  isCheckoutPackageId,
} from "@/constants/checkout-packages";
import { logServerError } from "@/lib/logger";
import { createAdminSupabaseClient } from "@/lib/supabase/service";

/**
 * Handles checkout.session.completed when payment_status is paid.
 * Returns null on success or when event is skipped; returns NextResponse on error.
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<NextResponse | null> {
  const { packageId, userId } = session.metadata ?? {};

  if (!packageId || !userId) {
    logServerError({
      context: "api",
      operation: "checkout_session_completed",
      message: "Missing metadata (packageId or userId)",
      errorMessage: JSON.stringify({ packageId, userId }),
    });
    return null;
  }

  if (!isCheckoutPackageId(packageId)) {
    logServerError({
      context: "api",
      operation: "checkout_session_completed",
      message: "Invalid packageId",
      errorMessage: packageId,
    });
    return null;
  }

  const creditsToGrant = getCreditsForPackage(packageId as CheckoutPackageId);

  try {
    const supabase = createAdminSupabaseClient();

    const { error: purchaseError } = await supabase.from("purchases").insert({
      stripe_session_id: session.id,
      user_id: userId,
      package_id: packageId,
      credits_granted: creditsToGrant,
    });

    if (purchaseError) {
      if (purchaseError.code === "23505") {
        console.log("[stripe webhook] session already processed", session.id);
        return null;
      }

      logServerError({
        context: "api",
        operation: "checkout_session_completed_purchase_insert",
        message: purchaseError.message,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    const { data: creditsRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (creditsRow == null) {
      logServerError({
        context: "api",
        operation: "checkout_session_completed_user_credits_lookup",
        message: "user_credits not found",
        errorMessage: userId,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        credits: creditsRow.credits + creditsToGrant,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      logServerError({
        context: "api",
        operation: "checkout_session_completed_user_credits_update",
        message: updateError.message,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    return null;
  } catch (err) {
    logServerError(
      {
        context: "api",
        operation: "checkout_session_completed",
        message: "Unexpected error",
      },
      err
    );
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
