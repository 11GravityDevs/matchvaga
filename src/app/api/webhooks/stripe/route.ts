/**
 * Stripe webhook endpoint. Configure in Dashboard: https://dashboard.stripe.com/webhooks
 * URL: https://<domain>/api/webhooks/stripe
 * Local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * (CLI prints a whsec_... secret to use as STRIPE_WEBHOOK_SECRET for that session.)
 */
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

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
        console.log("[stripe webhook] checkout.session.completed", event.id, {
          packageId,
          userId,
        });
        // TODO: persist purchase / grant credits when user_credits or purchases table exists
      }
      break;
    }
    default:
      // Unhandled event type; return 200 so Stripe does not retry
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
