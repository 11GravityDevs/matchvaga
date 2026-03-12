"use server";

import { z } from "zod";

import { logServerError } from "@/lib/logger";
import { getStripe } from "@/lib/stripe/client";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const getCheckoutSessionStatusSchema = z.object({
  sessionId: z.string().min(1, "Session ID inválido."),
});

export interface GetCheckoutSessionStatusResult {
  success: boolean;
  status?: "open" | "complete" | "expired";
  error?: string;
}

export async function getCheckoutSessionStatus(input: {
  sessionId: string;
}): Promise<GetCheckoutSessionStatusResult> {
  const parsed = getCheckoutSessionStatusSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Sessão de checkout inválida." };
  }

  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    logServerError(
      {
        context: "server_action",
        operation: "getCheckoutSessionStatus",
        action: "getCheckoutSessionStatus",
        message: "STRIPE_SECRET_KEY is not set",
      },
      err
    );
    return {
      success: false,
      error: "Não foi possível verificar o pagamento.",
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(
      parsed.data.sessionId
    );
    const { user } = auth;

    if (session.metadata?.userId !== user.id) {
      return { success: false, error: "Sessão de checkout não autorizada." };
    }

    if (
      session.status !== "open" &&
      session.status !== "complete" &&
      session.status !== "expired"
    ) {
      return { success: false, error: "Status de checkout inválido." };
    }

    return { success: true, status: session.status };
  } catch (err) {
    logServerError(
      {
        context: "server_action",
        operation: "getCheckoutSessionStatus",
        action: "getCheckoutSessionStatus",
        message: "Stripe error",
      },
      err
    );

    return {
      success: false,
      error: "Não foi possível verificar o pagamento.",
    };
  }
}
