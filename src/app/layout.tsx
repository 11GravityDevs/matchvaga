import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";

import { CookieConsent } from "@/components/shared/cookie-consent";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { UnsavedChangesProvider } from "@/contexts/unsaved-changes-context";
import { SITE_URL } from "@/constants/site";

import "./globals.css";

const DEFAULT_DESCRIPTION =
  "O MatchVaga adapta seu currículo automaticamente para cada vaga, otimiza para ATS e gera mensagens de apresentação — tudo em segundos. Plataforma #1 para candidatos no Brasil.";

const KEYWORDS = [
  "currículo",
  "otimização de currículo",
  "ATS",
  "vaga de emprego",
  "candidatura",
  "análise de currículo",
  "currículo para vaga",
  "Brasil",
  "LGPD",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MatchVaga - Chega de perder tempo com candidaturas",
    template: "%s • MatchVaga",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: "MatchVaga",
  authors: [{ name: "MatchVaga", url: SITE_URL }],
  creator: "MatchVaga",
  publisher: "MatchVaga",
  generator: "Next.js",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "MatchVaga",
    title: "MatchVaga - Chega de perder tempo com candidaturas",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "MatchVaga - Chega de perder tempo com candidaturas",
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      "pt-BR": SITE_URL,
      "x-default": SITE_URL,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <UnsavedChangesProvider>
                {children}
                <CookieConsent />
                <Analytics />
              </UnsavedChangesProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
