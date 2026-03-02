import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTE_HOME_CHECKOUT, ROUTE_HOME_DASHBOARD } from "@/constants/routes";

export default function CheckoutCancelPage() {
  return (
    <main className="flex flex-1 flex-col section-gap page-padding">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-page-title">Pagamento cancelado</h1>
          <p className="max-w-content text-page-subtitle text-muted-foreground">
            O pagamento não foi concluído. Você pode tentar novamente quando
            quiser.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="brand" asChild>
            <Link href={ROUTE_HOME_CHECKOUT}>Escolher pacote</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTE_HOME_DASHBOARD}>Ir para o Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
