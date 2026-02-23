import type { Metadata } from "next";

import { BackLink } from "@/components/shared/back-link";
import { BrandName } from "@/components/shared/brand-name";

export const metadata: Metadata = {
  title: "Política de Privacidade | MatchVaga",
  description:
    "Política de Privacidade do MatchVaga - como tratamos seus dados pessoais.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <BackLink className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" />

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 19 de fevereiro de 2025
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            1. Introdução
          </h2>
          <p className="text-muted-foreground">
            O <BrandName /> (&quot;nós&quot;, &quot;nosso&quot;) está
            comprometido com a proteção da sua privacidade. Esta Política
            descreve como coletamos, usamos, armazenamos e protegemos suas
            informações pessoais quando você utiliza nossa plataforma de análise
            e otimização de currículos.
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
              <strong className="text-foreground">Dados técnicos:</strong>{" "}
              endereço IP, tipo de navegador, páginas visitadas e horários de
              acesso.
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
            5. Compartilhamento de Dados
          </h2>
          <p className="text-muted-foreground">
            Não vendemos seus dados. Podemos compartilhar informações com:
            prestadores de serviços (hospedagem, e-mail, analytics) que atuam
            como operadores; autoridades quando exigido por lei; ou em caso de
            fusão ou aquisição, com aviso prévio.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            6. Retenção e Exclusão
          </h2>
          <p className="text-muted-foreground">
            Mantemos seus dados pelo tempo necessário para cumprir as
            finalidades descritas ou exigências legais. Você pode solicitar a
            exclusão de sua conta e dados a qualquer momento através do e-mail
            de suporte. Após a exclusão, os dados serão removidos em até 30
            dias, exceto quando a retenção for obrigatória por lei.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            7. Seus Direitos (LGPD)
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
            8. Segurança
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
            9. Alterações
          </h2>
          <p className="text-muted-foreground">
            Podemos atualizar esta Política periodicamente. Alterações
            significativas serão comunicadas por e-mail ou aviso na Plataforma.
            A data da última atualização será indicada no topo desta página.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            10. Contato
          </h2>
          <p className="text-muted-foreground">
            Para dúvidas sobre privacidade ou para exercer seus direitos, entre
            em contato através do e-mail de suporte disponível na Plataforma.
          </p>
        </section>
      </div>
    </article>
  );
}
