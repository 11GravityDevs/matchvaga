import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import type { GetCurrentUserDisplayResult } from "@/app/actions/user";
import { getQueryClient } from "@/lib/query/get-query-client";
import {
  analysesQueryOptions,
  currentUserDisplayQueryOptions,
} from "@/lib/query/query-options";

import { DashboardContent } from "./_components/dashboard-content";

interface DashboardPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(analysesQueryOptions);

  const displayData = queryClient.getQueryData<GetCurrentUserDisplayResult>(
    currentUserDisplayQueryOptions.queryKey
  );
  const name = displayData?.fullName?.split(" ")[0] ?? "Usuário";
  const { from } = await searchParams;

  const fromOnboarding = from === "onboarding";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent userName={name} fromOnboarding={fromOnboarding} />
    </HydrationBoundary>
  );
}
