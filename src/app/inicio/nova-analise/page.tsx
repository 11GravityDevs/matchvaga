import { Suspense } from "react";

import { QUERY_CONTINUE_ANALYSIS } from "@/constants/routes";
import { Loading } from "@/components/ui/loading";

import { NewAnalysisContent } from "./_components/new-analysis-content";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NewAnalysisPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialContinueId =
    typeof params[QUERY_CONTINUE_ANALYSIS] === "string"
      ? params[QUERY_CONTINUE_ANALYSIS]
      : null;

  return (
    <Suspense fallback={<Loading />}>
      <main className="flex min-h-0 flex-1 flex-col">
        <NewAnalysisContent initialContinueId={initialContinueId} />
      </main>
    </Suspense>
  );
}
