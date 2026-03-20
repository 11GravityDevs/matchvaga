"use client";

import { useEffect, useState } from "react";

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
  getPackagePriceCentavos,
  type CheckoutPackageId,
} from "@/constants/checkout-packages";

interface CheckoutCreditCardFormProps {
  packageId: CheckoutPackageId;
  onChooseAnotherPackage: () => void;
  chooseAnotherLabel?: string;
  onPaymentSuccess?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCentavosToBrl(amountCentavos: number): string {
  return brlFormatter.format(amountCentavos / 100);
}

export function CheckoutCreditCardForm({
  packageId,
  onChooseAnotherPackage,
  chooseAnotherLabel = "Escolher outro pacote",
  onPaymentSuccess,
  onSubmittingChange,
}: CheckoutCreditCardFormProps) {
  const checkoutState = useCheckout();
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null
  );

  const packageName = getPackageName(packageId);
  const packagePriceCentavos = getPackagePriceCentavos(packageId);

  useEffect(() => {
    onSubmittingChange?.(isSubmittingPayment);
  }, [isSubmittingPayment, onSubmittingChange]);

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
            {chooseAnotherLabel}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const handleSubmitPayment = async () => {
    setSubmitErrorMessage(null);
    setIsSubmittingPayment(true);

    if (checkoutState.type !== "success") {
      setIsSubmittingPayment(false);
      return;
    }

    const result = await checkoutState.checkout.confirm();

    if (result.type === "error") {
      setSubmitErrorMessage(
        result.error.message ?? "Não foi possível concluir o pagamento."
      );
    } else {
      onPaymentSuccess?.();
    }

    setIsSubmittingPayment(false);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="w-full border border-border">
        <CardContent className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Finalizar compra do pacote</CardTitle>

            <span className="text-base font-semibold text-accent-brand">
              {packageName}
            </span>
          </div>

          <span className="text-xl font-bold">
            {formatCentavosToBrl(packagePriceCentavos)}
          </span>
        </CardContent>
      </Card>

      <Card className="w-full border border-border">
        <CardHeader>
          <CardTitle>Dados de pagamento</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <PaymentElement options={{ layout: "accordion" }} />

          {submitErrorMessage && (
            <p className="text-small text-destructive" role="alert">
              {submitErrorMessage}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap justify-end gap-3 pt-4">
          <Button
            variant="outline"
            size="brand"
            type="button"
            onClick={onChooseAnotherPackage}
            disabled={isSubmittingPayment}
          >
            {chooseAnotherLabel}
          </Button>
          <Button
            variant="brand"
            size="brand"
            type="button"
            loading={isSubmittingPayment}
            onClick={handleSubmitPayment}
          >
            Continuar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
