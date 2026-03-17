interface FAQItem {
  question: string;
  answer: string;
  linkLabel?: string;
  linkHref?: string;
}

export const FAQ_ITEMS: readonly FAQItem[] = [
  {
    question: "Como o MatchVaga funciona na prática?",
    answer:
      "Você faz upload do seu currículo, cola a vaga desejada e o MatchVaga compara as duas informações para identificar gaps, destacar pontos fortes e gerar uma versão otimizada do seu currículo para aquela oportunidade.",
  },
  {
    question: "O que eu recebo ao fazer uma análise?",
    answer:
      "Você recebe uma análise de compatibilidade entre currículo e vaga, os principais gaps do seu perfil e um currículo otimizado para a oportunidade. A exportação do documento final em PDF ou DOCX fica disponível para você baixar após a compra dos créditos.",
  },
  {
    question: "Preciso de experiência técnica para usar o MatchVaga?",
    answer:
      "Não. O processo foi pensado para ser simples: você envia seu currículo, informa a vaga e a plataforma conduz o restante. Mesmo quem nunca usou uma ferramenta desse tipo consegue fazer tudo em poucos minutos.",
  },
  {
    question: "Como funcionam os créditos e as análises?",
    answer:
      "O MatchVaga funciona por créditos, sem assinatura. Cada análise completa utiliza um crédito da sua conta, e você escolhe o pacote que faz mais sentido para o seu momento, desde candidaturas pontuais até volumes maiores. Seus créditos não expiram, então você pode usar no seu ritmo, sem pressa.",
  },
  {
    question:
      "O MatchVaga funciona para quem está buscando o primeiro emprego ou mudando de área?",
    answer:
      "Sim. Nesses casos, a análise de gap costuma ser ainda mais útil porque mostra com mais clareza o que está faltando para a vaga desejada e ajuda você a apresentar melhor as experiências, projetos e habilidades que já tem.",
  },
  {
    question: "Posso pedir reembolso se eu desistir da compra?",
    answer:
      "Sim. Se você comprou e ainda não usou os créditos, pode solicitar reembolso integral em até 7 dias após a compra, conforme nossos",
    linkLabel: "Termos de Serviço",
    linkHref: "/termos-de-servico",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Seus dados são tratados com medidas de segurança, controle de acesso e criptografia. Também não vendemos suas informações e o tratamento segue nossa Política de Privacidade e a LGPD. Os dados enviados para análise e geração dos documentos são usados apenas para prestar o serviço dentro da plataforma, e não para treinar modelos fundacionais de terceiros.",
  },
] as const;
