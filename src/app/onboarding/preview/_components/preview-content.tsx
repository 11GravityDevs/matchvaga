"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  MAX_W_PREVIEW_DESC,
  MAX_W_PREVIEW_TITLE,
  PAGE_TITLE_CLASS,
} from "@/constants/design-tokens";
import { ROUTE_ONBOARDING_UPLOAD } from "@/constants/routes";
import { cn } from "@/utils/style";

import { StepDots } from "./step-dots";
import { StepOneIllustration } from "./illustrations/step-one-illustration";
import { StepTwoIllustration } from "./illustrations/step-two-illustration";
import { StepThreeIllustration } from "./illustrations/step-three-illustration";
import { StepFourIllustration } from "./illustrations/step-four-illustration";

interface StepData {
  title: string;
  description: string;
  illustration: React.ReactNode;
}

const STEPS: StepData[] = [
  {
    title: "Envie seu currículo e edite seus dados",
    description:
      "Faça upload do seu PDF ou DOCX apenas uma vez e nós extraímos todas as informações automaticamente. Revise e ajuste o que precisar.",
    illustration: <StepOneIllustration />,
  },
  {
    title: "Analise vagas com inteligência artificial",
    description:
      "Cole o link da vaga e nossa IA compara automaticamente com seu currículo, mostrando o match e as skills mais relevantes.",
    illustration: <StepTwoIllustration />,
  },
  {
    title: "Escolha as habilidades certas para cada vaga",
    description:
      "Nossa IA sugere as skills mais relevantes baseadas na vaga. Selecione quais incluir e gere um currículo personalizado em segundos.",
    illustration: <StepThreeIllustration />,
  },
  {
    title: "Pronto! Seu currículo com match perfeito",
    description:
      "Parabéns! Agora você tem um currículo otimizado pela IA, adaptado especificamente para cada vaga que desejar. Comece agora!",
    illustration: <StepFourIllustration />,
  },
];

const TOTAL_STEPS = STEPS.length;

export function PreviewContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const step = STEPS[currentStep];

  const handleNext = useCallback(() => {
    if (isLastStep) {
      router.push(ROUTE_ONBOARDING_UPLOAD);
      return;
    }
    setCurrentStep((prev) => prev + 1);
  }, [isLastStep, router]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  return (
    <>
      {/* Illustration */}
      {step.illustration}

      {/* Step dots */}
      <StepDots currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Text block */}
      <div className="flex flex-col items-center gap-3">
        <h1
          className={cn(PAGE_TITLE_CLASS, MAX_W_PREVIEW_TITLE, "text-center")}
        >
          {step.title}
        </h1>
        <p
          className={cn(
            MAX_W_PREVIEW_DESC,
            "text-center text-base leading-relaxed text-muted-foreground"
          )}
        >
          {step.description}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        {!isFirstStep && !isLastStep && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="w-30"
          >
            Voltar
          </Button>
        )}
        <Button
          variant="brand"
          size="lg"
          onClick={handleNext}
          className={isLastStep ? "w-60" : "w-50"}
        >
          {isLastStep ? "Começar agora" : "Próximo"}
        </Button>
      </div>
    </>
  );
}
