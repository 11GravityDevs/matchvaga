/**
 * Stripe webhook endpoint. Configure in Dashboard: https://dashboard.stripe.com/webhooks
 * URL: https://<domain>/api/webhooks/stripe
 * Local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * (CLI prints a whsec_... secret to use as STRIPE_WEBHOOK_SECRET for that session.)
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { logServerError } from "@/lib/logger";
import { handleCheckoutSessionCompleted } from "./_utils/handle-checkout-session-completed";
import { verifyStripeWebhook } from "./_utils/verify-webhook";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.trim() === "") {
    logServerError({
      context: "api",
      operation: "stripe_webhook",
      message: "STRIPE_WEBHOOK_SECRET is not set",
    });
    return NextResponse.json(
      { message: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const result = await verifyStripeWebhook(request, webhookSecret);

  if ("errorResponse" in result) {
    return result.errorResponse;
  }

  const { event } = result;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        const errorResponse = await handleCheckoutSessionCompleted(session);

        if (errorResponse) {
          return errorResponse;
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
