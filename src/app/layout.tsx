import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/constants/site";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { QueryProvider } from "@/components/providers/query-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    template: "%s | MatchVaga",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "MatchVaga",
    title: "MatchVaga - Chega de perder tempo com candidaturas",
    description: DEFAULT_DESCRIPTION,
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
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <QueryProvider>
          {children}
          <CookieConsent />
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  );
}
