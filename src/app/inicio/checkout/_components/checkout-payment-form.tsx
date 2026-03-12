"use client";

import { useState } from "react";

import { PaymentElement, useCheckout } from "@stripe/react-stripe-js/checkout";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getPackageName,
  type CheckoutPackageId,
} from "@/constants/checkout-packages";

interface CheckoutPaymentFormProps {
  packageId: CheckoutPackageId;
  onChooseAnotherPackage: () => void;
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown, key: string): string | null {
  if (!isRecord(value)) return null;
  const property = value[key];
  return typeof property === "string" && property.length > 0 ? property : null;
}

function getNumber(value: unknown, key: string): number | null {
  if (!isRecord(value)) return null;
  const property = value[key];
  return typeof property === "number" ? property : null;
}

function getLineItemTotalCentavos(lineItem: unknown): number | null {
  if (!isRecord(lineItem)) return null;
  const amountTotal = lineItem.amountTotal;
  if (!isRecord(amountTotal)) return null;
  const amount = amountTotal.amount;
  if (typeof amount === "number") return amount;
  if (typeof amount === "string") {
    const parsedAmount = Number(amount);
    return Number.isFinite(parsedAmount) ? parsedAmount : null;
  }
  return null;
}

function getAmountCentavos(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsedAmount = Number(value);
    if (Number.isFinite(parsedAmount)) {
      return parsedAmount;
    }
  }
  return 0;
}

function formatCentavosToBrl(amountCentavos: number): string {
  return brlFormatter.format(amountCentavos / 100);
}

export function CheckoutPaymentForm({
  packageId,
  onChooseAnotherPackage,
}: CheckoutPaymentFormProps) {
  const checkoutState = useCheckout();
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null
  );

  const packageName = getPackageName(packageId);

  if (checkoutState.type === "loading") {
    return (
      <Card className="w-full border border-border">
        <CardHeader>
          <CardTitle className="text-card-title">
            Carregando checkout...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (checkoutState.type === "error") {
    return (
      <Card className="w-full border border-border">
        <CardHeader>
          <CardTitle className="text-card-title">
            Erro ao carregar checkout
          </CardTitle>
        </CardHeader>
        <CardContent className="text-small text-muted-foreground">
          {checkoutState.error.message}
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <Button
            variant="outline"
            size="brand"
            type="button"
            onClick={onChooseAnotherPackage}
          >
            Escolher outro pacote
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const lineItems = checkoutState.checkout.lineItems as unknown[];
  const checkoutTotalCentavos = getAmountCentavos(
    checkoutState.checkout.total.total.amount
  );

  const checkoutSummaryItems = lineItems.map((lineItem, index) => {
    const itemName =
      getString(lineItem, "name") ??
      getString(lineItem, "description") ??
      `Item ${index + 1}`;
    const quantity = getNumber(lineItem, "quantity") ?? 1;
    const totalCentavos = getLineItemTotalCentavos(lineItem);

    return {
      id: `${itemName}-${index}`,
      itemName,
      quantity,
      totalCentavos,
    };
  });

  const handleSubmitPayment = async () => {
    setSubmitErrorMessage(null);
    setIsSubmittingPayment(true);

    const result = await checkoutState.checkout.confirm();

    if (result.type === "error") {
      setSubmitErrorMessage(
        result.error.message ?? "Não foi possível concluir o pagamento."
      );
    }

    setIsSubmittingPayment(false);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="w-full border border-border">
        <CardHeader>
          <CardTitle className="text-card-title">
            Finalizar compra do pacote {packageName}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {checkoutSummaryItems.map((summaryItem) => (
              <div
                key={summaryItem.id}
                className="flex items-center justify-between"
              >
                <span className="text-small text-foreground">
                  {summaryItem.quantity}x {summaryItem.itemName}
                </span>
                <span className="text-small-medium text-foreground">
                  {summaryItem.totalCentavos !== null
                    ? formatCentavosToBrl(summaryItem.totalCentavos)
                    : "-"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-small-semibold">Total</span>
            <span className="text-small-semibold">
              {formatCentavosToBrl(checkoutTotalCentavos)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full border border-border">
        <CardHeader>
          <CardTitle className="text-card-title">Dados de pagamento</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <PaymentElement options={{ layout: "accordion" }} />

          {submitErrorMessage && (
            <p className="text-small text-destructive" role="alert">
              {submitErrorMessage}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          <Button
            variant="outline"
            size="brand"
            type="button"
            onClick={onChooseAnotherPackage}
            disabled={isSubmittingPayment}
          >
            Escolher outro pacote
          </Button>
          <Button
            variant="brand"
            size="brand"
            type="button"
            loading={isSubmittingPayment}
            onClick={handleSubmitPayment}
          >
            Pagar agora
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
