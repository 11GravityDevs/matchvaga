import { SITE_URL } from "@/constants/site";

import { FAQ_ITEMS } from "../_constants/faq";

const SOFTWARE_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MatchVaga",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
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
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      name: "Grátis",
    },
    {
      "@type": "Offer",
      price: "19.90",
      priceCurrency: "BRL",
      name: "Profissional",
    },
  ],
};

const FAQ_PAGE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function LandingStructuredData() {
  return (
    <>
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
