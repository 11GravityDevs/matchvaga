/**
 * AbacatePay webhook endpoint. Configure in Dashboard: https://app.abacatepay.com/webhooks
 * URL: https://<tunnel>/api/webhooks/abacatepay
 * Local testing: run `yarn tunnel`
 */
import { NextResponse } from "next/server";

import { logServerError } from "@/lib/logger";

import { handlePaymentPaid } from "./_utils/handle-payment-paid";
import { verifyAbacatePayWebhook } from "./_utils/verify-webhook";

const PAYMENT_PAID_EVENTS = ["billing.paid"] as const;

export async function POST(request: Request) {
  const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  const publicKey = process.env.ABACATEPAY_PUBLIC_KEY;

  if (!webhookSecret?.trim()) {
    logServerError({
      context: "api",
      operation: "abacatepay_webhook",
      message: "ABACATEPAY_WEBHOOK_SECRET is not set",
    });
    return NextResponse.json(
      { message: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  if (!publicKey?.trim()) {
    logServerError({
      context: "api",
      operation: "abacatepay_webhook",
      message: "ABACATEPAY_PUBLIC_KEY is not set",
    });
    return NextResponse.json(
      { message: "Webhook signature key not configured" },
      { status: 500 }
    );
  }

  const result = await verifyAbacatePayWebhook(
    request,
    webhookSecret,
    publicKey
  );

  if ("errorResponse" in result) {
    return result.errorResponse;
  }

  const { payload } = result;

  const isPaymentPaid = PAYMENT_PAID_EVENTS.includes(
    payload.event as (typeof PAYMENT_PAID_EVENTS)[number]
  );

  if (isPaymentPaid) {
    const errorResponse = await handlePaymentPaid(payload);
    if (errorResponse) {
      return errorResponse;
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
