import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query/get-query-client";
import { analysesQueryOptions } from "@/lib/query/query-options";
import { createClient } from "@/lib/supabase/server";

import { DashboardContent } from "./_components/dashboard-content";

export default async function DashboardPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(analysesQueryOptions);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuário";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent userName={userName} />
    </HydrationBoundary>
  );
}
