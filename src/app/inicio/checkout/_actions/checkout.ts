"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { SITE_URL } from "@/constants/site";
import { logServerError } from "@/lib/logger";
import { translateAuthError } from "@/utils/auth";
import {
  type CheckoutPackageId,
  CHECKOUT_PACKAGE_IDS,
  getPackageName,
  getPackagePriceCentavos,
} from "@/constants/checkout-packages";

const createCheckoutSessionSchema = z.object({
  packageId: z.enum(CHECKOUT_PACKAGE_IDS),
});

export interface CreateCheckoutSessionResult {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export async function createCheckoutSession(input: {
  packageId: string;
}): Promise<CreateCheckoutSessionResult> {
  const parsed = createCheckoutSessionSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Pacote inválido." };
  }

  const { packageId } = parsed.data as { packageId: CheckoutPackageId };

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return { success: false, error: translateAuthError(authError) };
  }

  if (!user) {
    return { success: false, error: "Faça login para continuar." };
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    logServerError(
      {
        context: "server_action",
        operation: "createCheckoutSession",
        action: "createCheckoutSession",
        message: "STRIPE_SECRET_KEY is not set",
      },
      err
    );

    return { success: false, error: "Configuração de pagamento indisponível." };
  }

  const priceCentavos = getPackagePriceCentavos(packageId);
  const packageName = getPackageName(packageId);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "brl",
      locale: "pt-BR",
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: priceCentavos,
            product_data: {
              name: `MatchVaga — ${packageName}`,
            },
          },
          quantity: 1,
        },
      ],
      payment_method_types: ["card"],
      success_url: `${SITE_URL}/inicio/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/inicio/checkout/cancelar`,
      metadata: {
        packageId,
        userId: user.id,
      },
    });

    if (!session.url) {
      logServerError({
        context: "server_action",
        operation: "createCheckoutSession",
        action: "createCheckoutSession",
        message: "Stripe session has no url",
      });
      return {
        success: false,
        error: "Erro ao iniciar checkout. Tente novamente.",
      };
    }

    return { success: true, checkoutUrl: session.url };
  } catch (err) {
    logServerError(
      {
        context: "server_action",
        operation: "createCheckoutSession",
        action: "createCheckoutSession",
        message: "Stripe error",
      },
      err
    );
    return {
      success: false,
      error: "Erro ao iniciar checkout. Tente novamente.",
    };
  }
}
