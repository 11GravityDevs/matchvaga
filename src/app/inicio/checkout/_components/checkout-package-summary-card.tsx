import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

interface CheckoutPackageSummaryCardProps {
  packageName: string;
  priceFormatted: string;
  onBack?: () => void;
}

export function CheckoutPackageSummaryCard({
  packageName,
  priceFormatted,
  onBack,
}: CheckoutPackageSummaryCardProps) {
  return (
    <Card className="w-full border border-border">
      <CardContent className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Finalizar compra do pacote</CardTitle>
          <span className="text-base font-semibold text-accent-brand">
            {packageName}
          </span>
        </div>
        <span className="text-xl font-bold">{priceFormatted}</span>
      </CardContent>
      {onBack ? (
        <CardFooter className="justify-end border-t border-border pt-4">
          <Button variant="outline" size="brand" type="button" onClick={onBack}>
            Escolher outro pacote
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
