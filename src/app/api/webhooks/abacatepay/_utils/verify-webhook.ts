import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { logServerError } from "@/lib/logger";

export interface AbacatePayWebhookPayload {
  event?: string;
  data?: Record<string, unknown>;
}

export async function verifyAbacatePayWebhook(
  request: Request,
  webhookSecret: string,
  signatureKey: string
): Promise<
  { payload: AbacatePayWebhookPayload } | { errorResponse: NextResponse }
> {
  const webhookSecretFromQuery = new URL(request.url).searchParams.get(
    "webhookSecret"
  );
  if (webhookSecretFromQuery !== webhookSecret) {
    return {
      errorResponse: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const signatureHeader = request.headers.get("x-webhook-signature");
  if (!signatureHeader) {
    return {
      errorResponse: NextResponse.json(
        { message: "Missing webhook signature" },
        { status: 400 }
      ),
    };
  }

  try {
    const rawBody = await request.text();

    const expected = crypto
      .createHmac("sha256", signatureKey)
      .update(Buffer.from(rawBody, "utf8"))
      .digest("base64");
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signatureHeader);
    const valid =
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    if (!valid) {
      return {
        errorResponse: NextResponse.json(
          { message: "Webhook signature verification failed" },
          { status: 400 }
        ),
      };
    }

    const payload = JSON.parse(rawBody) as AbacatePayWebhookPayload;
    return { payload };
  } catch (err) {
    logServerError(
      {
        context: "api",
        operation: "abacatepay_verify_webhook",
        message:
          err instanceof SyntaxError
            ? "Invalid webhook payload JSON"
            : "Signature verification failed",
      },
      err
    );
    return {
      errorResponse: NextResponse.json(
        {
          message:
            err instanceof SyntaxError
              ? "Invalid payload"
              : "Webhook signature verification failed",
        },
        { status: 400 }
      ),
    };
  }
}
