import crypto from "node:crypto";

import { NextResponse } from "next/server";

import {
  type CheckoutPackageId,
  getCreditsForPackage,
  isCheckoutPackageId,
} from "@/constants/checkout-packages";
import { logServerError } from "@/lib/logger";
import { createAdminSupabaseClient } from "@/lib/supabase/service";

interface AbacatePayWebhookPayload {
  event?: string;
  data?: Record<string, unknown>;
}

function verifySignature(rawBody: string, signature: string): boolean {
  const signatureKey = process.env.ABACATEPAY_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey?.trim()) return false;

  const expected = crypto
    .createHmac("sha256", signatureKey)
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

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

export async function POST(request: Request): Promise<NextResponse> {
  const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  const webhookSignatureKey = process.env.ABACATEPAY_WEBHOOK_SIGNATURE_KEY;
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
  if (!webhookSignatureKey?.trim()) {
    logServerError({
      context: "api",
      operation: "abacatepay_webhook",
      message: "ABACATEPAY_WEBHOOK_SIGNATURE_KEY is not set",
    });
    return NextResponse.json(
      { message: "Webhook signature key not configured" },
      { status: 500 }
    );
  }

  const signatureHeader = request.headers.get("x-webhook-signature");
  if (!signatureHeader) {
    return NextResponse.json(
      { message: "Missing webhook signature" },
      { status: 400 }
    );
  }

  const webhookSecretFromQuery = new URL(request.url).searchParams.get(
    "webhookSecret"
  );
  if (webhookSecretFromQuery !== webhookSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  if (!verifySignature(rawBody, signatureHeader)) {
    return NextResponse.json(
      { message: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  let payload: AbacatePayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as AbacatePayWebhookPayload;
  } catch (err) {
    logServerError(
      {
        context: "api",
        operation: "abacatepay_webhook",
        message: "Invalid webhook payload JSON",
      },
      err
    );
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  if (payload.event !== "pix.paid") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const chargeId = extractPixChargeId(payload);
  if (!chargeId) {
    logServerError({
      context: "api",
      operation: "abacatepay_webhook",
      message: "Missing charge id in pix.paid payload",
    });
    return NextResponse.json({ received: true }, { status: 200 });
  }

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

    if (!pendingCharge) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const packageId = pendingCharge.package_id;
    if (!isCheckoutPackageId(packageId)) {
      logServerError({
        context: "api",
        operation: "abacatepay_webhook",
        message: "Invalid package id in pending PIX charge",
        errorMessage: packageId,
      });
      return NextResponse.json({ received: true }, { status: 200 });
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
      if (purchaseInsertError.code === "23505") {
        return NextResponse.json({ received: true }, { status: 200 });
      }

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
        {
          onConflict: "user_id",
        }
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
    }

    return NextResponse.json({ received: true }, { status: 200 });
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
