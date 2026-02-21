import { Sidebar } from "@/components/shared/sidebar";

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
