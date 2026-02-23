"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { ResumeData } from "@/types/resume";
import { getResumeForUser } from "@/app/actions/resume";

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
  isLoadingResume: boolean;
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
  jobRole: string;
  analysisId: string | null;
  score: number | null;
  matchedSkills: string[];
  missingSkills: MissingSkill[];
  selectedMissingSkills: string[];
  isAnalyzing: boolean;
  analysisError: string | null;
  setStep: (step: WizardStep) => void;
  setJobTitle: (value: string) => void;
  setJobCompany: (value: string) => void;
  setJobDescription: (value: string) => void;
  setJobRole: (value: string) => void;
  setAnalysisResult: (result: {
    analysisId: string;
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
  }) => void;
  toggleSkill: (id: string) => void;
  setSelectedMissingSkills: (skills: string[]) => void;
  setAnalysisError: (error: string | null) => void;
  setIsAnalyzing: (value: boolean) => void;
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
  jobTitle: "",
  jobCompany: "",
  jobDescription: "",
  jobRole: "",
  analysisId: null as string | null,
  score: null as number | null,
  matchedSkills: [] as string[],
  missingSkills: [] as MissingSkill[],
  selectedMissingSkills: [] as string[],
};

export function NewAnalysisProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<WizardStep>(INITIAL_STATE.step);
  const [resumeId, setResumeId] = useState<string | null>(
    INITIAL_STATE.resumeId
  );
  const [resumeData, setResumeData] = useState<ResumeData | null>(
    INITIAL_STATE.resumeData
  );
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [jobTitle, setJobTitle] = useState(INITIAL_STATE.jobTitle);
  const [jobCompany, setJobCompany] = useState(INITIAL_STATE.jobCompany);
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchResume() {
      const result = await getResumeForUser();
      if (cancelled) return;

      if (result.success && result.resumeId && result.data) {
        setResumeId(result.resumeId);
        setResumeData(result.data as ResumeData);
      } else {
        setResumeId(null);
        setResumeData(null);
      }
      setIsLoadingResume(false);
    }

    fetchResume();
    return () => {
      cancelled = true;
    };
  }, []);

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
      setAnalysisError(null);
    },
    []
  );

  function toggleSkill(id: string) {
    setMissingSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  }

  const refreshResume = useCallback(async () => {
    const result = await getResumeForUser();
    if (result.success && result.resumeId && result.data) {
      setResumeId(result.resumeId);
      setResumeData(result.data as ResumeData);
    }
  }, []);

  function reset() {
    setStep(INITIAL_STATE.step);
    setJobTitle(INITIAL_STATE.jobTitle);
    setJobCompany(INITIAL_STATE.jobCompany);
    setJobDescription(INITIAL_STATE.jobDescription);
    setJobRole(INITIAL_STATE.jobRole);
    setAnalysisId(INITIAL_STATE.analysisId);
    setScore(INITIAL_STATE.score);
    setMatchedSkills(INITIAL_STATE.matchedSkills);
    setMissingSkills(INITIAL_STATE.missingSkills);
    setSelectedMissingSkills(INITIAL_STATE.selectedMissingSkills);
    setAnalysisError(null);
  }

  return (
    <NewAnalysisContext.Provider
      value={{
        step,
        resumeId,
        resumeData,
        isLoadingResume,
        jobTitle,
        jobCompany,
        jobDescription,
        jobRole,
        analysisId,
        score,
        matchedSkills,
        missingSkills,
        selectedMissingSkills,
        isAnalyzing,
        analysisError,
        setStep,
        setJobTitle,
        setJobCompany,
        setJobDescription,
        setJobRole,
        setAnalysisResult,
        toggleSkill,
        setSelectedMissingSkills,
        setAnalysisError,
        setIsAnalyzing,
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
