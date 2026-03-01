import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import { CheckoutContent } from "./_components/checkout-content";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Loading />}>
      <main className="flex min-h-0 flex-1 flex-col">
        <CheckoutContent />
      </main>
    </Suspense>
  );
}
