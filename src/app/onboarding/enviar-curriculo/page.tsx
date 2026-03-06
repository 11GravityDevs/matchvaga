import { Suspense } from "react";

import { UploadContent } from "./_components/upload-content";
import { Loading } from "@/components/ui/loading";

export default function OnboardingUploadPage() {
  return (
    <Suspense fallback={<Loading />}>
      <UploadContent />
    </Suspense>
  );
}
