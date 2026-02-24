export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex-1">{children}</div>
    </main>
  );
}
