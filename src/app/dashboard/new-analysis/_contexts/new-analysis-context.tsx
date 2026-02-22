"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type WizardStep = 1 | 2 | 3;

export const WIZARD_STEPS = [
  { id: "1", label: "Vaga" },
  { id: "2", label: "Análise" },
  { id: "3", label: "Exportar" },
];

export interface MissingSkill {
  id: string;
  label: string;
  selected: boolean;
}

interface NewAnalysisContextValue {
  step: WizardStep;
  jobDescription: string;
  jobRole: string;
  missingSkills: MissingSkill[];
  setStep: (step: WizardStep) => void;
  setJobDescription: (value: string) => void;
  setJobRole: (value: string) => void;
  toggleSkill: (id: string) => void;
  reset: () => void;
}

const NewAnalysisContext = createContext<NewAnalysisContextValue | null>(null);

const initialSkills: MissingSkill[] = [
  { id: "nextjs", label: "Next.js", selected: true },
  { id: "graphql", label: "GraphQL", selected: true },
  { id: "cicd", label: "CI/CD Pipelines", selected: true },
  { id: "testing", label: "Testes Automatizados", selected: false },
  { id: "design-system", label: "Design System", selected: false },
  { id: "micro-frontend", label: "Micro-frontends", selected: false },
];

export function NewAnalysisProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<WizardStep>(1);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("Desenvolvedor Frontend - Nubank");
  const [missingSkills, setMissingSkills] =
    useState<MissingSkill[]>(initialSkills);

  function toggleSkill(id: string) {
    setMissingSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  }

  function reset() {
    setStep(1);
    setJobDescription("");
    setJobRole("Desenvolvedor Frontend - Nubank");
    setMissingSkills(initialSkills);
  }

  return (
    <NewAnalysisContext.Provider
      value={{
        step,
        jobDescription,
        jobRole,
        missingSkills,
        setStep,
        setJobDescription,
        setJobRole,
        toggleSkill,
        reset,
      }}
    >
      {children}
    </NewAnalysisContext.Provider>
  );
}

export function useNewAnalysis() {
  const ctx = useContext(NewAnalysisContext);
  if (!ctx)
    throw new Error("useNewAnalysis must be inside NewAnalysisProvider");
  return ctx;
}
