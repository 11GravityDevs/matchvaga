/**
 * Stripe webhook endpoint. Configure in Dashboard: https://dashboard.stripe.com/webhooks
 * URL: https://<domain>/api/webhooks/stripe
 * Local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * (CLI prints a whsec_... secret to use as STRIPE_WEBHOOK_SECRET for that session.)
 */
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminSupabaseClient } from "@/lib/supabase/service";
import {
  type CheckoutPackageId,
  getCreditsForPackage,
  isCheckoutPackageId,
} from "@/app/home/checkout/_constants/packages";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.trim()) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.trim() === "") {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { message: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe webhook] Signature verification failed:", message);
    return NextResponse.json(
      { message: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        const { packageId, userId } = session.metadata ?? {};

        if (!packageId || !userId) {
          console.error(
            "[stripe webhook] checkout.session.completed missing metadata",
            event.id,
            { packageId, userId }
          );
          break;
        }

        if (!isCheckoutPackageId(packageId)) {
          console.error(
            "[stripe webhook] checkout.session.completed invalid packageId",
            event.id,
            { packageId }
          );
          break;
        }

        const creditsToGrant = getCreditsForPackage(
          packageId as CheckoutPackageId
        );

        try {
          const supabase = createAdminSupabaseClient();

          const { error: purchaseError } = await supabase
            .from("purchases")
            .insert({
              stripe_session_id: session.id,
              user_id: userId,
              package_id: packageId,
              credits_granted: creditsToGrant,
            });

          if (purchaseError) {
            if (purchaseError.code === "23505") {
              console.log(
                "[stripe webhook] session already processed",
                session.id
              );
              break;
            }

            console.error(
              "[stripe webhook] purchase insert error:",
              purchaseError.message
            );

            return NextResponse.json(
              { message: "Database error" },
              { status: 500 }
            );
          }

          const { data: creditsRow } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", userId)
            .single();

          if (creditsRow != null) {
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
              return NextResponse.json(
                { message: "Database error" },
                { status: 500 }
              );
            }
          } else {
            const { error: insertError } = await supabase
              .from("user_credits")
              .insert({ user_id: userId, credits: creditsToGrant });

            if (insertError) {
              console.error(
                "[stripe webhook] user_credits insert error:",
                insertError.message
              );

              return NextResponse.json(
                { message: "Database error" },
                { status: 500 }
              );
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error("[stripe webhook] unexpected error:", message);

          return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
          );
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
