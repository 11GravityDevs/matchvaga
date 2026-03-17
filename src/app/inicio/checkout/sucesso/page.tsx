import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ROUTE_HOME_CHECKOUT_CANCEL,
  ROUTE_HOME_DASHBOARD,
  ROUTE_HOME_NEW_ANALYSIS,
} from "@/constants/routes";

import { getCheckoutSessionStatus } from "../_actions/get-checkout-session-status";
import { getPixPaymentStatus } from "../_actions/get-pix-payment-status";
import { CheckoutSuccessTracker } from "../_components/checkout-success-tracker";
import { CheckoutUnlockHandler } from "../_components/checkout-unlock-handler";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
    payment_id?: string;
    unlock?: string;
  }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const {
    session_id: sessionId,
    payment_id: paymentId,
    unlock,
  } = await searchParams;

  if (!sessionId && !paymentId) {
    redirect(ROUTE_HOME_CHECKOUT_CANCEL);
  }

  if (sessionId) {
    const sessionStatusResult = await getCheckoutSessionStatus({ sessionId });

    if (
      !sessionStatusResult.success ||
      sessionStatusResult.status !== "complete"
    ) {
      redirect(ROUTE_HOME_CHECKOUT_CANCEL);
    }
  }

  if (paymentId) {
    const pixStatusResult = await getPixPaymentStatus({ paymentId });
    if (!pixStatusResult.success || pixStatusResult.status !== "paid") {
      redirect(ROUTE_HOME_CHECKOUT_CANCEL);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center section-gap page-padding">
      <CheckoutSuccessTracker
        sessionId={sessionId}
        paymentId={paymentId}
        paymentProvider={paymentId ? "pix" : "stripe"}
      />
      {unlock && <CheckoutUnlockHandler analysisId={unlock} />}
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-accent-success-light">
          <CheckCircle2 className="size-16 text-accent-success" />
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-page-title">Pagamento concluído</h1>
          <p className="max-w-content text-page-subtitle text-muted-foreground">
            Obrigado pela compra. Seu pagamento foi processado com sucesso.
            {!unlock &&
              (sessionId || paymentId) &&
              " Em breve você terá acesso às análises."}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="brand" asChild>
              <Link href={ROUTE_HOME_DASHBOARD}>Ir para o Dashboard</Link>
            </Button>
            <Button variant="brand" size="brand" asChild>
              <Link
                href={
                  unlock
                    ? `${ROUTE_HOME_NEW_ANALYSIS}?continue=${unlock}`
                    : ROUTE_HOME_NEW_ANALYSIS
                }
              >
                {unlock ? "Ver currículo desbloqueado" : "Nova análise"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
