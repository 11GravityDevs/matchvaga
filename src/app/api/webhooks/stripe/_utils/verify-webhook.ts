import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { logServerError } from "@/lib/logger";
import { getStripe } from "@/lib/stripe/client";

export async function verifyStripeWebhook(
  request: Request,
  webhookSecret: string
): Promise<{ event: Stripe.Event } | { errorResponse: NextResponse }> {
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return {
      errorResponse: NextResponse.json(
        { message: "Missing stripe-signature header" },
        { status: 400 }
      ),
    };
  }

  try {
    const body = await request.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    return { event };
  } catch (err) {
    logServerError(
      {
        context: "api",
        operation: "verify_webhook",
        message: "Signature verification failed",
      },
      err
    );
    return {
      errorResponse: NextResponse.json(
        { message: "Webhook signature verification failed" },
        { status: 400 }
      ),
    };
  }
}
