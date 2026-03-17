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
      payment_provider: "stripe",
      external_id: session.id,
      user_id: userId,
      package_id: packageId,
      credits_granted: creditsToGrant,
    });

    if (purchaseError) {
      if (purchaseError.code === "23505") {
        console.debug("[stripe webhook] session already processed", session.id);
        return null;
      }

      logServerError({
        context: "api",
        operation: "checkout_session_completed_purchase_insert",
        message: purchaseError.message,
      });
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    const { data: currentCreditsRow, error: creditsSelectError } =
      await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .maybeSingle();

    if (creditsSelectError) {
      logServerError({
        context: "api",
        operation: "checkout_session_completed_user_credits_select",
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
          user_id: userId,
          credits: newCreditsTotal,
        },
        {
          onConflict: "user_id",
        }
      );

    if (creditsUpsertError) {
      logServerError({
        context: "api",
        operation: "checkout_session_completed_user_credits_increment",
        message: creditsUpsertError.message,
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
