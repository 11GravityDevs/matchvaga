import { Suspense } from "react";

import { VerifyContent } from "./_components/verify-content";
import { Loading } from "@/components/ui/loading";

export default function OnboardingVerifyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyContent />
    </Suspense>
  );
}
