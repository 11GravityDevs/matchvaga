import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query/get-query-client";
import {
  analysesQueryOptions,
  resumeQueryOptions,
} from "@/lib/query/query-options";

import { DashboardContent } from "./_components/dashboard-content";

interface DashboardPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(resumeQueryOptions),
    queryClient.prefetchQuery(analysesQueryOptions),
  ]);
  const { data } = queryClient.getQueryData(resumeQueryOptions.queryKey) ?? {};

  const name = data?.fullName.split(" ")[0] ?? "Usuário";
  const { from } = await searchParams;
  const fromOnboarding = from === "onboarding";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent userName={name} fromOnboarding={fromOnboarding} />
    </HydrationBoundary>
  );
}
