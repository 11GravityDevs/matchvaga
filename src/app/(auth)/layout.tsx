import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Entre na sua conta MatchVaga para acessar análises de currículo e otimizações.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full [--primary:var(--accent-brand)]">
      {children}
    </main>
  );
}
