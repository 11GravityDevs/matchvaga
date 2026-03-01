import Link from "next/link";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTE_HOME_CHECKOUT, ROUTE_HOME_DASHBOARD } from "@/constants/routes";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  return (
    <main className="flex flex-1 flex-col section-gap page-padding">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent-success-light">
          <CheckCircle2 className="size-10 text-accent-success" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-page-title">Pagamento concluído</h1>
          <p className="max-w-content text-page-subtitle text-muted-foreground">
            Obrigado pela compra. Seu pagamento foi processado com sucesso.
            {sessionId && " Em breve você terá acesso às análises."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="brand" asChild>
            <Link href={ROUTE_HOME_DASHBOARD}>Ir para o Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTE_HOME_CHECKOUT}>Voltar ao Checkout</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
