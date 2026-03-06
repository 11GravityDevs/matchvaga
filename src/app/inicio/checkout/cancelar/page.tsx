import Link from "next/link";

import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTE_HOME_CHECKOUT, ROUTE_HOME_DASHBOARD } from "@/constants/routes";

export default function CheckoutCancelPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center section-gap page-padding">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="size-16 text-destructive" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-page-title">Pagamento cancelado</h1>
          <p className="max-w-content text-page-subtitle text-muted-foreground">
            O pagamento não foi concluído. Você pode tentar novamente quando
            quiser.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="brand" asChild>
            <Link href={ROUTE_HOME_DASHBOARD}>Ir para o Dashboard</Link>
          </Button>
          <Button variant="brand" size="brand" asChild>
            <Link href={ROUTE_HOME_CHECKOUT}>Escolher pacote</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
