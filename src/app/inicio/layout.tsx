import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { NewAnalysisResetProvider } from "@/app/inicio/_contexts/new-analysis-reset-context";
import { Sidebar } from "@/components/shared/sidebar";
import { getQueryClient } from "@/lib/query/get-query-client";
import { currentUserDisplayQueryOptions } from "@/lib/query/query-options";

export const metadata: Metadata = {
  title: "MatchVaga",
  description: "Gerencie suas análises de currículo e documentos otimizados.",
  robots: { index: false, follow: false },
};

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default async function HomeLayout({ children }: HomeLayoutProps) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(currentUserDisplayQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex h-screen w-full overflow-hidden bg-background [--primary:var(--accent-brand)]">
        <Sidebar />
        <NewAnalysisResetProvider>
          <div className="flex flex-1 flex-col overflow-auto">{children}</div>
        </NewAnalysisResetProvider>
      </main>
    </HydrationBoundary>
  );
}
