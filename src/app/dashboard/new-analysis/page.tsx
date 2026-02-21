import { Suspense } from "react";

import { Loading } from "@/components/ui/loading";

import { NewAnalysisContent } from "./_components/new-analysis-content";

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex min-h-0 flex-1 flex-col">
        <NewAnalysisContent />
      </div>
    </Suspense>
  );
}
