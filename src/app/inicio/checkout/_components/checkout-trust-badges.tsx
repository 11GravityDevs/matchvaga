import { Clock, CreditCard, Shield } from "lucide-react";

export function CheckoutTrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-small text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" />
        Análises sem validade
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Shield className="size-3.5" />
        Pagamento seguro
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CreditCard className="size-3.5" />
        Cartão ou PIX
      </span>
    </div>
  );
}
