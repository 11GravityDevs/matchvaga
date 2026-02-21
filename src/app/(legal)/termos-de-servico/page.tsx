import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { BrandName } from "@/components/shared/brand-name";

export const metadata: Metadata = {
  title: "Termos de Serviço | MatchVaga",
  description:
    "Termos de Serviço do MatchVaga - plataforma de análise e otimização de currículos.",
};

export default function TermosDeServicoPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Termos de Serviço
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 19 de fevereiro de 2025
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            1. Aceitação dos Termos
          </h2>
          <p className="text-muted-foreground">
            Ao acessar ou utilizar o <BrandName /> (&quot;Plataforma&quot;),
            você concorda em cumprir e estar vinculado a estes Termos de
            Serviço. Se você não concordar com qualquer parte destes termos, não
            deverá utilizar nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            2. Descrição do Serviço
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
            3. Cadastro e Conta
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
            4. Uso Aceitável
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
            5. Propriedade Intelectual e Dados
          </h2>
          <p className="text-muted-foreground">
            A Plataforma, incluindo sua interface, algoritmos e marca, é de
            propriedade do <BrandName />. Os currículos e documentos que você
            envia permanecem de sua propriedade. Ao utilizar o serviço, você nos
            concede uma licença limitada para processar seus dados
            exclusivamente para fornecer e melhorar os serviços, conforme
            descrito em nossa Política de Privacidade.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            6. Limitação de Responsabilidade
          </h2>
          <p className="text-muted-foreground">
            O <BrandName /> não garante resultados específicos de emprego ou
            aprovação em processos seletivos. A análise é baseada em algoritmos
            e pode conter imprecisões. Na máxima extensão permitida por lei, não
            seremos responsáveis por danos indiretos, incidentais ou
            consequenciais decorrentes do uso da Plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            7. Alterações e Rescisão
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
            8. Contato
          </h2>
          <p className="text-muted-foreground">
            Para dúvidas sobre estes Termos, entre em contato através do e-mail
            de suporte disponível na Plataforma.
          </p>
        </section>
      </div>
    </article>
  );
}
