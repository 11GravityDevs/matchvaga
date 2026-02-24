import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query/get-query-client";
import {
  analysesQueryOptions,
  resumeQueryOptions,
} from "@/lib/query/query-options";

import { DashboardContent } from "./_components/dashboard-content";

export default async function DashboardPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(resumeQueryOptions),
    queryClient.prefetchQuery(analysesQueryOptions),
  ]);
  const { data } = queryClient.getQueryData(resumeQueryOptions.queryKey) ?? {};

  const name = data?.fullName.split(" ")[0] ?? "Usuário";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent userName={name} />
    </HydrationBoundary>
  );
}
