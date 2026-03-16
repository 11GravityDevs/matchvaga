"use cache";

import type { Metadata } from "next";

import { BrandName } from "@/components/shared/brand-name";
import { Logo } from "@/components/shared/logo";
import { SUPPORT_EMAIL } from "@/constants/contact";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do MatchVaga - como tratamos seus dados pessoais. Conformidade com LGPD.",
  keywords: ["privacidade", "LGPD", "dados pessoais", "MatchVaga"],
};

export default async function PoliticaDePrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 15 de março de 2025
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert w-full max-w-none space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            1. Introdução e Controlador de Dados
          </h2>
          <p className="text-muted-foreground">
            O <BrandName /> (&quot;nós&quot;, &quot;nosso&quot;) atua como
            Controlador de Dados e está comprometido com a proteção da sua
            privacidade, em estrita conformidade com a Lei Geral de Proteção de
            Dados Pessoais (LGPD - Lei nº 13.709/2018). Esta Política descreve
            como coletamos, usamos, armazenamos e protegemos suas informações
            pessoais quando você utiliza nossa plataforma de análise e
            otimização de currículos.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            2. Dados que Coletamos
          </h2>
          <p className="mb-4 text-muted-foreground">
            Coletamos os seguintes tipos de dados:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>
              <strong className="text-foreground">Dados de cadastro:</strong>{" "}
              e-mail, nome (quando fornecido) e credenciais de autenticação.
            </li>
            <li>
              <strong className="text-foreground">Dados de uso:</strong>{" "}
              currículos enviados, descrições de vagas analisadas, resultados de
              análise e documentos gerados.
            </li>
            <li>
              <strong className="text-foreground">Dados de pagamento:</strong>{" "}
              histórico de transações e saldo de créditos. Não armazenamos os
              dados do seu cartão de crédito (processamento pelo Stripe).
            </li>
            <li>
              <strong className="text-foreground">Dados técnicos:</strong>{" "}
              endereço IP, tipo de navegador, horários de acesso.
            </li>
            <li>
              <strong className="text-foreground">
                Aviso sobre Dados Sensíveis:
              </strong>{" "}
              Recomendamos que você{" "}
              <strong className="text-foreground">não inclua</strong> em seu
              currículo dados pessoais sensíveis (convicção religiosa, opinião
              política, filiação a sindicato, dados referentes à saúde ou à vida
              sexual).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            3. Finalidade do Tratamento
          </h2>
          <p className="text-muted-foreground">
            Utilizamos seus dados para: (a) fornecer e operar a Plataforma; (b)
            realizar a análise de lacunas entre currículo e vagas; (c) gerar
            documentos otimizados; (d) melhorar nossos algoritmos e serviços;
            (e) enviar comunicações relacionadas ao serviço; (f) cumprir
            obrigações legais e (g) garantir a segurança da Plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            4. Base Legal (LGPD)
          </h2>
          <p className="text-muted-foreground">
            O tratamento de dados pessoais é realizado com base em: execução de
            contrato (prestação do serviço), consentimento (quando aplicável),
            legítimo interesse (melhoria do serviço e segurança) e cumprimento
            de obrigação legal.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            5. Compartilhamento e Transferência Internacional
          </h2>
          <p className="mb-4 text-muted-foreground">
            Não vendemos ou comercializamos seus dados pessoais. Compartilhamos
            suas informações estritamente com os seguintes Operadores
            necessários para o funcionamento da plataforma:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Provedores de hospedagem e banco de dados (ex: Supabase);</li>
            <li>Processadores de pagamento (ex: Stripe);</li>
            <li>
              APIs de Inteligência Artificial (ex: Anthropic, Google) para
              análise e geração de texto;
            </li>
            <li>Ferramentas de análise de uso (ex: PostHog).</li>
          </ul>
          <p className="text-muted-foreground">
            Conforme o Art. 33 da LGPD, parte do tratamento de dados ocorre em
            servidores localizados fora do Brasil (principalmente EUA). Essas
            transferências são realizadas com garantias adequadas, incluindo
            cláusulas contratuais padrão e compromissos de proteção equivalentes
            à legislação brasileira, conforme exigido pela Autoridade Nacional
            de Proteção de Dados (ANPD).
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            6. Tratamento por Inteligência Artificial
          </h2>
          <p className="text-muted-foreground">
            Currículos e descrições de vagas que você envia são processados por
            APIs de inteligência artificial exclusivamente para extração de
            informações, análise de lacunas e geração de documentos otimizados.
            Conforme as políticas desses provedores, seus dados não são
            utilizados para treinamento de modelos. O tratamento é realizado em
            ambiente seguro e com fins estritamente vinculados à prestação do
            serviço.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            7. Cookies
          </h2>
          <p className="mb-4 text-muted-foreground">
            Utilizamos os seguintes tipos de cookies:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>
              <strong className="text-foreground">Essenciais:</strong> cookies
              de autenticação (Supabase) necessários para o funcionamento da
              Plataforma.
            </li>
            <li>
              <strong className="text-foreground">Analíticos:</strong> cookies
              do PostHog para análise de uso, ativados apenas com seu
              consentimento explícito.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            8. Retenção e Exclusão
          </h2>
          <p className="text-muted-foreground">
            Mantemos seus dados pelo tempo necessário para cumprir as
            finalidades descritas ou exigências legais. Você pode solicitar a
            exclusão de sua conta e dados a qualquer momento através do e-mail{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
            >
              {SUPPORT_EMAIL}
            </a>
            . Após a exclusão, os dados serão removidos em até 30 dias, exceto
            quando a retenção for obrigatória por lei.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            9. Seus Direitos (LGPD)
          </h2>
          <p className="text-muted-foreground">
            Você tem direito a: confirmar a existência de tratamento; acessar
            seus dados; corrigir dados incompletos ou desatualizados;
            anonimizar, bloquear ou eliminar dados desnecessários; portar seus
            dados; revogar o consentimento; e obter informações sobre
            compartilhamento. Para exercer esses direitos, entre em contato
            conosco.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            10. Segurança
          </h2>
          <p className="text-muted-foreground">
            Adotamos medidas técnicas e organizacionais para proteger seus dados
            contra acesso não autorizado, alteração, divulgação ou destruição,
            incluindo criptografia, controles de acesso e monitoramento de
            segurança.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            11. Alterações
          </h2>
          <p className="text-muted-foreground">
            Podemos atualizar esta Política periodicamente. Alterações
            significativas serão comunicadas por e-mail ou aviso na Plataforma.
            A data da última atualização será indicada no topo desta página.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            13. Contato e Encarregado de Dados (DPO)
          </h2>
          <p className="text-muted-foreground">
            Para dúvidas sobre privacidade, sobre esta política, ou para exercer
            seus direitos sob a LGPD, entre em contato com nosso Encarregado de
            Proteção de Dados (DPO) pelo e-mail:{" "}
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
