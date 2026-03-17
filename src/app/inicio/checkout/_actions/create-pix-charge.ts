"use server";

import { z } from "zod";

import {
  CHECKOUT_PACKAGE_IDS,
  getPackagePriceCentavos,
} from "@/constants/checkout-packages";
import { logServerError } from "@/lib/logger";
import {
  createAbacatePixCharge,
  type CreatePixChargeData,
} from "@/lib/abacatepay/client";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const createPixChargeSchema = z.object({
  packageId: z.enum(CHECKOUT_PACKAGE_IDS),
  analysisId: z.uuid().optional(),
});

export interface CreatePixChargeResult {
  success: boolean;
  paymentId?: string;
  brCode?: string;
  brCodeBase64?: string;
  expiresAt?: string;
  error?: string;
}

function mapCreateResponse(
  chargeData: CreatePixChargeData
): CreatePixChargeResult {
  return {
    success: true,
    paymentId: chargeData.id,
    brCode: chargeData.brCode,
    brCodeBase64: chargeData.brCodeBase64,
    expiresAt: chargeData.expiresAt,
  };
}

export async function createPixCharge(input: {
  packageId: string;
  analysisId?: string;
}): Promise<CreatePixChargeResult> {
  const parsed = createPixChargeSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Pacote inválido." };
  }

  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { packageId, analysisId } = parsed.data;
  const amount = getPackagePriceCentavos(packageId);

  try {
    const result = await createAbacatePixCharge({
      amount,
      expiresIn: 60 * 15,
      description: `MatchVaga ${packageId}`,
      metadata: {
        packageId,
        userId: auth.user.id,
        ...(analysisId && { analysisId }),
      },
    });

    if (result.error || !result.data) {
      return {
        success: false,
        error: "Não foi possível gerar o PIX. Tente novamente.",
      };
    }

    const { error: pendingInsertError } = await auth.supabase
      .from("pix_pending_charges")
      .upsert(
        {
          charge_id: result.data.id,
          user_id: auth.user.id,
          package_id: packageId,
          analysis_id: analysisId ?? null,
        },
        { onConflict: "charge_id" }
      );

    if (pendingInsertError) {
      logServerError({
        context: "server_action",
        operation: "createPixCharge",
        action: "createPixCharge",
        message: pendingInsertError.message,
      });
      return {
        success: false,
        error: "Não foi possível gerar o PIX. Tente novamente.",
      };
    }

    return mapCreateResponse(result.data);
  } catch (err) {
    logServerError(
      {
        context: "server_action",
        operation: "createPixCharge",
        action: "createPixCharge",
        message: "Unexpected error creating PIX charge",
      },
      err
    );

    return {
      success: false,
      error: "Não foi possível gerar o PIX. Tente novamente.",
    };
  }
}
