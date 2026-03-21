import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import { isCheckoutPackageId } from "@/constants/checkout-packages";
import { CheckoutContent } from "./_components/checkout-content";

interface CheckoutPageProps {
  searchParams: Promise<{ unlock?: string; package?: string }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { unlock, package: packageParam } = await searchParams;
  const initialPackageId =
    packageParam && isCheckoutPackageId(packageParam)
      ? packageParam
      : undefined;
  return (
    <Suspense fallback={<Loading />}>
      <main className="flex min-h-0 flex-1 flex-col">
        <CheckoutContent
          unlockAnalysisId={unlock ?? undefined}
          initialPackageId={initialPackageId}
        />
      </main>
    </Suspense>
  );
}
