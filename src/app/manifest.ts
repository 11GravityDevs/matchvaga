import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MatchVaga - Chega de perder tempo com candidaturas",
    short_name: "MatchVaga",
    description:
      "O MatchVaga adapta seu currículo automaticamente para cada vaga, otimiza para ATS e gera mensagens de apresentação — tudo em segundos.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      },
    ],
    lang: "pt-BR",
  };
}
