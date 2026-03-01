import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Sidebar } from "@/components/shared/sidebar";
import { getQueryClient } from "@/lib/query/get-query-client";
import { currentUserDisplayQueryOptions } from "@/lib/query/query-options";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Gerencie suas análises de currículo e documentos otimizados.",
  robots: { index: false, follow: false },
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(currentUserDisplayQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex h-screen w-full overflow-hidden bg-background [--primary:var(--accent-brand)]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-auto">{children}</div>
      </main>
    </HydrationBoundary>
  );
}
