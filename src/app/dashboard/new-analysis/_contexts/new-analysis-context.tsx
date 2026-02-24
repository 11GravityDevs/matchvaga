"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { ResumeData } from "@/types/resume";
import { useResumeQuery } from "@/hooks/use-resume-query";

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
  resumeId: string | null;
  resumeData: ResumeData | null;
  optimizedResumeData: ResumeData | null;
  isLoadingResume: boolean;
  jobDescription: string;
  jobRole: string;
  analysisId: string | null;
  score: number | null;
  matchedSkills: string[];
  missingSkills: MissingSkill[];
  selectedMissingSkills: string[];
  setStep: (step: WizardStep) => void;
  setJobDescription: (value: string) => void;
  setJobRole: (value: string) => void;
  setAnalysisResult: (result: {
    analysisId: string;
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
  }) => void;
  setOptimizedResumeData: (data: ResumeData | null) => void;
  toggleSkill: (id: string) => void;
  setSelectedMissingSkills: (skills: string[]) => void;
  refreshResume: () => Promise<void>;
  reset: () => void;
}

const NewAnalysisContext = createContext<NewAnalysisContextValue | null>(null);

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function toMissingSkills(labels: string[]): MissingSkill[] {
  return labels.map((label) => ({
    id: slugify(label),
    label,
    selected: true,
  }));
}

const INITIAL_STATE = {
  step: 1 as WizardStep,
  resumeId: null as string | null,
  resumeData: null as ResumeData | null,
  optimizedResumeData: null as ResumeData | null,
  jobDescription: "",
  jobRole: "",
  analysisId: null as string | null,
  score: null as number | null,
  matchedSkills: [] as string[],
  missingSkills: [] as MissingSkill[],
  selectedMissingSkills: [] as string[],
};

export function NewAnalysisProvider({ children }: { children: ReactNode }) {
  const {
    resumeId: queryResumeId,
    resumeData: queryResumeData,
    hasNoResume,
    isLoading: isLoadingResume,
    refetch: refetchResume,
  } = useResumeQuery();

  const resumeId = hasNoResume ? null : queryResumeId;
  const resumeData = hasNoResume ? null : queryResumeData;

  const [step, setStep] = useState<WizardStep>(INITIAL_STATE.step);
  const [jobDescription, setJobDescription] = useState(
    INITIAL_STATE.jobDescription
  );
  const [jobRole, setJobRole] = useState(INITIAL_STATE.jobRole);
  const [analysisId, setAnalysisId] = useState<string | null>(
    INITIAL_STATE.analysisId
  );
  const [score, setScore] = useState<number | null>(INITIAL_STATE.score);
  const [matchedSkills, setMatchedSkills] = useState<string[]>(
    INITIAL_STATE.matchedSkills
  );
  const [missingSkills, setMissingSkills] = useState<MissingSkill[]>(
    INITIAL_STATE.missingSkills
  );
  const [selectedMissingSkills, setSelectedMissingSkills] = useState<string[]>(
    INITIAL_STATE.selectedMissingSkills
  );
  const [optimizedResumeData, setOptimizedResumeData] =
    useState<ResumeData | null>(INITIAL_STATE.optimizedResumeData);

  const setAnalysisResult = useCallback(
    (result: {
      analysisId: string;
      score: number;
      matchedSkills: string[];
      missingSkills: string[];
    }) => {
      setAnalysisId(result.analysisId);
      setScore(result.score);
      setMatchedSkills(result.matchedSkills);
      const skills = toMissingSkills(result.missingSkills);
      setMissingSkills(skills);
      setSelectedMissingSkills(result.missingSkills);
    },
    []
  );

  function toggleSkill(id: string) {
    setMissingSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  }

  const refreshResume = useCallback(async () => {
    await refetchResume();
  }, [refetchResume]);

  function reset() {
    setStep(INITIAL_STATE.step);
    setJobDescription(INITIAL_STATE.jobDescription);
    setJobRole(INITIAL_STATE.jobRole);
    setAnalysisId(INITIAL_STATE.analysisId);
    setScore(INITIAL_STATE.score);
    setMatchedSkills(INITIAL_STATE.matchedSkills);
    setMissingSkills(INITIAL_STATE.missingSkills);
    setSelectedMissingSkills(INITIAL_STATE.selectedMissingSkills);
    setOptimizedResumeData(INITIAL_STATE.optimizedResumeData);
  }

  return (
    <NewAnalysisContext.Provider
      value={{
        step,
        resumeId,
        resumeData,
        optimizedResumeData,
        isLoadingResume,
        jobDescription,
        jobRole,
        analysisId,
        score,
        matchedSkills,
        missingSkills,
        selectedMissingSkills,
        setStep,
        setJobDescription,
        setJobRole,
        setAnalysisResult,
        setOptimizedResumeData,
        toggleSkill,
        setSelectedMissingSkills,
        refreshResume,
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
