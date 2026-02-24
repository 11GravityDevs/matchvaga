import { Suspense } from "react";

import { Loading } from "@/components/ui/loading";

import { NewAnalysisContent } from "./_components/new-analysis-content";

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={<Loading />}>
      <main className="flex min-h-0 flex-1 flex-col">
        <NewAnalysisContent />
      </main>
    </Suspense>
  );
}
