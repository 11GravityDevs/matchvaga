"use cache";

import type { Metadata } from "next";

import { BrandName } from "@/components/shared/brand-name";
import { Logo } from "@/components/shared/logo";
import { SUPPORT_EMAIL } from "@/constants/contact";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description:
    "Termos de Serviço do MatchVaga - plataforma de análise e otimização de currículos para vagas no Brasil.",
  keywords: ["termos de uso", "MatchVaga", "currículo", "plataforma"],
};

export default async function TermosDeServicoPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col items-center px-6 py-12">
      <Logo
        href="/"
        className="mb-10 flex-col gap-3"
        iconContainerClassName="h-16 w-16 rounded-xl"
        iconClassName="h-8 w-8"
        textClassName="text-3xl font-bold"
      />

      <header className="mb-10 w-full text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Termos de Serviço
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 15 de março de 2025
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert w-full max-w-none space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            1. Aceitação dos Termos
          </h2>
          <p className="text-muted-foreground">
            Ao acessar ou utilizar o <BrandName /> (&quot;Plataforma&quot;),
            você concorda em cumprir e estar vinculado a estes Termos de
            Serviço. Se você não concordar com qualquer parte destes termos, não
            deverá utilizar nossos serviços. O tratamento de dados pessoais está
            disciplinado em nossa{" "}
            <a
              href="/politica-de-privacidade"
              className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
            >
              Política de Privacidade
            </a>
            , em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei
            13.709/2018). Nas relações de consumo, aplica-se o Código de Defesa
            do Consumidor (Lei 8.078/90).
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            2. Elegibilidade
          </h2>
          <p className="text-muted-foreground">
            O serviço é disponibilizado para maiores de 18 anos ou emancipados.
            Ao utilizar a Plataforma, você declara atender a esse requisito.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            3. Descrição do Serviço
          </h2>
          <p className="text-muted-foreground">
            O <BrandName /> é uma plataforma SaaS que oferece: (a) análise da
            lacuna entre seu currículo e descrições de vagas; (b) identificação
            de competências faltantes para o cargo desejado; (c) geração de
            documentos otimizados (PDF/DOCX) adaptados à vaga. Os serviços são
            prestados &quot;como estão&quot;, sujeitos à disponibilidade e às
            limitações técnicas.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            4. Cadastro e Conta
          </h2>
          <p className="text-muted-foreground">
            Para utilizar a Plataforma, você deve fornecer informações
            verdadeiras e manter sua conta atualizada. Você é responsável pela
            confidencialidade de suas credenciais e por todas as atividades
            realizadas em sua conta. Notifique-nos imediatamente em caso de uso
            não autorizado.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            5. Créditos, Pagamentos e Reembolsos
          </h2>
          <p className="mb-4 text-muted-foreground">
            O <BrandName /> opera com um sistema de créditos de análise. Ao
            adquirir créditos, você concorda com as seguintes condições:
          </p>
          <ul className="mb-8 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>
              <strong className="text-foreground">Faturamento:</strong> Os
              pagamentos são processados de forma segura via Stripe. Não
              armazenamos os dados completos do seu cartão de crédito.
            </li>
            <li>
              <strong className="text-foreground">Uso de Créditos:</strong> Os
              créditos são vinculados à sua conta e descontados a cada análise
              ou serviço prestado pela Plataforma.
            </li>
            <li>
              <strong className="text-foreground">
                Arrependimento e Reembolso:
              </strong>{" "}
              Conforme o Art. 49 do Código de Defesa do Consumidor, você tem o
              direito de solicitar reembolso integral em até 7 (sete) dias após
              a compra, desde que os créditos adquiridos não tenham sido
              utilizados. Créditos já consumidos na plataforma não são
              reembolsáveis.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            6. Uso Aceitável
          </h2>
          <p className="text-muted-foreground">
            Você concorda em utilizar a Plataforma apenas para fins legítimos e
            de acordo com estes Termos. É proibido: usar o serviço para fins
            ilegais; enviar conteúdo falso ou enganoso; tentar acessar áreas
            restritas ou comprometer a segurança; utilizar robôs ou automação
            não autorizada; ou violar direitos de terceiros.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            7. Propriedade Intelectual e Dados
          </h2>
          <p className="mb-4 text-muted-foreground">
            A Plataforma, incluindo sua interface, algoritmos e marca, é de
            propriedade do <BrandName />. Os currículos e documentos originais
            que você envia permanecem de sua exclusiva propriedade.
          </p>
          <p className="text-muted-foreground">
            Ao utilizar o serviço, você nos concede uma licença limitada para
            processar seus dados exclusivamente para fornecer os serviços (como
            análise e geração de documentos), conforme descrito em nossa
            Política de Privacidade. Você detém os direitos sobre os documentos
            gerados pela Plataforma a partir dos seus dados.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            8. Limitação de Responsabilidade e Uso de IA
          </h2>
          <p className="mb-4 text-muted-foreground">
            O <BrandName /> não garante resultados específicos de emprego,
            entrevistas ou aprovação em processos seletivos. A análise de
            lacunas e a geração de currículos são suportadas por Inteligência
            Artificial (IA) e podem conter imprecisões, alucinações ou
            informações inadequadas para o seu contexto.
          </p>
          <p className="mb-4 text-muted-foreground">
            Garantimos que os dados inseridos por você na Plataforma{" "}
            <strong className="text-foreground">não são utilizados</strong> para
            treinamento de modelos fundacionais de inteligência artificial de
            terceiros.
          </p>
          <p className="text-muted-foreground">
            Você é o único responsável por revisar, editar e validar o conteúdo
            final do seu currículo antes de enviá-lo a qualquer vaga. Na máxima
            extensão permitida por lei, não seremos responsáveis por danos
            indiretos, incidentais ou consequenciais decorrentes do uso da
            Plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            9. Alterações e Rescisão
          </h2>
          <p className="text-muted-foreground">
            Podemos alterar estes Termos a qualquer momento. Alterações
            significativas serão comunicadas por e-mail ou aviso na Plataforma.
            O uso continuado após as alterações constitui aceitação. Podemos
            suspender ou encerrar sua conta em caso de violação destes Termos.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            10. Foro e Lei Aplicável
          </h2>
          <p className="text-muted-foreground">
            Para consumidores, aplica-se o foro da comarca do domicílio do
            consumidor (Art. 101 do CDC). Demais casos serão dirimidos no foro
            da comarca da sede da empresa. A lei brasileira rege estes Termos.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            11. Contato
          </h2>
          <p className="text-muted-foreground">
            Para dúvidas sobre estes Termos, entre em contato pelo e-mail:{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </article>
  );
}
