import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import { CheckoutContent } from "./_components/checkout-content";

interface CheckoutPageProps {
  searchParams: Promise<{ unlock?: string }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { unlock } = await searchParams;
  return (
    <Suspense fallback={<Loading />}>
      <main className="flex min-h-0 flex-1 flex-col">
        <CheckoutContent unlockAnalysisId={unlock ?? undefined} />
      </main>
    </Suspense>
  );
}
