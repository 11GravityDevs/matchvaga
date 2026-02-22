import { Suspense } from "react";

import { Loading } from "@/components/ui/loading";

import { PreviewContent } from "./_components/preview-content";

export default function PreviewPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PreviewContent />
    </Suspense>
  );
}
