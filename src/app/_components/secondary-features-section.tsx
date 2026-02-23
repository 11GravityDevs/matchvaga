import {
  History,
  Languages,
  LayoutTemplate,
  Lock,
  ShieldCheck,
  Timer,
} from "lucide-react";

interface SecondaryFeature {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

interface FeatureCardProps {
  feature: SecondaryFeature;
}

const FEATURES_COL_1: SecondaryFeature[] = [
  {
    icon: <ShieldCheck className="size-5.5 text-accent-brand" />,
    iconBg: "bg-accent-brand-light",
    title: "Otimização ATS",
    description:
      "Cada currículo é otimizado para passar pelos filtros de Applicant Tracking Systems.",
  },
  {
    icon: <LayoutTemplate className="size-5.5 text-accent-purple" />,
    iconBg: "bg-accent-purple-light",
    title: "Múltiplos Formatos",
    description:
      "Exporte em PDF, DOCX ou copie direto para plataformas de candidatura.",
  },
];

const FEATURES_COL_2: SecondaryFeature[] = [
  {
    icon: <Languages className="size-5.5 text-accent-success" />,
    iconBg: "bg-accent-success-light",
    title: "Multilíngue",
    description:
      "Gere currículos e mensagens em português, inglês, espanhol e outros idiomas.",
  },
  {
    icon: <History className="size-5.5 text-accent-pink" />,
    iconBg: "bg-accent-pink-light",
    title: "Histórico Completo",
    description:
      "Acompanhe todas suas candidaturas, versões de currículo e análises em um só lugar.",
  },
];

const FEATURES_COL_3: SecondaryFeature[] = [
  {
    icon: <Timer className="size-5.5 text-accent-warning" />,
    iconBg: "bg-accent-warning-light",
    title: "Economia de Tempo",
    description:
      "Reduza horas de trabalho manual para menos de 2 minutos por candidatura.",
  },
  {
    icon: <Lock className="size-5.5 text-destructive" />,
    iconBg: "bg-accent-low-light",
    title: "Privacidade Total",
    description:
      "Seus dados são criptografados e nunca compartilhados com terceiros.",
  },
];

function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-7">
      <div
        className={`flex size-11 items-center justify-center rounded-lg ${feature.iconBg}`}
      >
        {feature.icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </div>
  );
}

export function SecondaryFeaturesSection() {
  return (
    <section className="flex w-full flex-col items-center gap-12 bg-surface-subtle py-20">
      {/* Section Header */}
      <div className="flex max-w-section-header flex-col items-center gap-4">
        <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent-brand">
          RECURSOS EXTRAS
        </span>
        <h2 className="text-center text-section-header-large">
          E muito mais para acelerar sua busca
        </h2>
        <p className="text-center text-base leading-normal text-muted-foreground">
          Cada detalhe pensado para maximizar suas chances de conseguir a vaga.
        </p>
      </div>

      {/* Feature Grid - 3 columns, 2 rows, equal card heights */}
      <div className="grid w-full auto-rows-fr grid-cols-3 gap-6">
        {[0, 1].flatMap((rowIndex) =>
          [FEATURES_COL_1, FEATURES_COL_2, FEATURES_COL_3].map(
            (col, colIndex) => (
              <FeatureCard
                key={`${colIndex}-${rowIndex}`}
                feature={col[rowIndex]!}
              />
            )
          )
        )}
      </div>
    </section>
  );
}
