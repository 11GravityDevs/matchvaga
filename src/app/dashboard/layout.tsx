import type { Metadata } from "next";

import { Sidebar } from "@/components/shared/sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Gerencie suas análises de currículo e documentos otimizados.",
  robots: { index: false, follow: false },
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-background [--primary:var(--accent-brand)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-auto">{children}</div>
    </main>
  );
}
