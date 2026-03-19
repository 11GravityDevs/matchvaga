import { SITE_URL } from "@/constants/site";
import {
  CHECKOUT_PACKAGE_IDS,
  getPackageName,
  getPackagePriceCentavos,
} from "@/constants/checkout-packages";

import { FAQ_ITEMS, getFaqAnswerText } from "../_constants/faq";

const SOFTWARE_OFFERS_JSON_LD = CHECKOUT_PACKAGE_IDS.map((packageId) => ({
  "@type": "Offer" as const,
  price: (getPackagePriceCentavos(packageId) / 100).toFixed(2),
  priceCurrency: "BRL",
  name: getPackageName(packageId),
  availability: "https://schema.org/InStock",
  url: SITE_URL,
}));

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MatchVaga",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  description:
    "MatchVaga é uma plataforma SaaS que adapta currículos automaticamente para cada vaga, otimiza para sistemas ATS e gera mensagens de apresentação com IA. Focada no mercado de candidatos no Brasil.",
  inLanguage: "pt-BR",
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MatchVaga",
  url: SITE_URL,
  description:
    "MatchVaga é uma plataforma que adapta seu currículo automaticamente para cada vaga, otimiza para ATS e gera mensagens de apresentação — tudo em segundos.",
  publisher: {
    "@type": "Organization",
    name: "MatchVaga",
    url: SITE_URL,
  },
  inLanguage: "pt-BR",
};

const SOFTWARE_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MatchVaga",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  publisher: {
    "@type": "Organization",
    name: "MatchVaga",
    url: SITE_URL,
  },
  description:
    "O MatchVaga adapta seu currículo automaticamente para cada vaga, otimiza para ATS e gera mensagens de apresentação — tudo em segundos. Plataforma #1 para candidatos no Brasil.",
  inLanguage: "pt-BR",
  featureList: [
    "Análise de gap entre currículo e vaga",
    "Otimização para sistemas ATS",
    "Currículo adaptado para cada vaga",
    "Mensagens de apresentação geradas por IA",
    "Exportação em PDF e DOCX",
  ],
  offers: SOFTWARE_OFFERS_JSON_LD,
};

const FAQ_PAGE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: getFaqAnswerText(item),
    },
  })),
};

export function LandingStructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ORGANIZATION_JSON_LD),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(WEBSITE_JSON_LD),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(SOFTWARE_APPLICATION_JSON_LD),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_PAGE_JSON_LD),
        }}
      />
    </>
  );
}
