import { NextResponse } from "next/server";
import Stripe from "stripe";

import {
  type CheckoutPackageId,
  getCreditsForPackage,
  isCheckoutPackageId,
} from "@/constants/checkout-packages";
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
    console.error(
      "[stripe webhook] checkout.session.completed missing metadata",
      { packageId, userId }
    );
    return null;
  }

  if (!isCheckoutPackageId(packageId)) {
    console.error(
      "[stripe webhook] checkout.session.completed invalid packageId",
      { packageId }
    );
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

      console.error(
        "[stripe webhook] purchase insert error:",
        purchaseError.message
      );
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    const { data: creditsRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (creditsRow == null) {
      console.error("[stripe webhook] user_credits not found", userId);
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
      console.error(
        "[stripe webhook] user_credits update error:",
        updateError.message
      );
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe webhook] unexpected error:", message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
