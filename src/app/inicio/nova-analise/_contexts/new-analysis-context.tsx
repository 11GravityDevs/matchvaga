"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { getAnalysisById } from "@/app/actions/analysis";
import { Loading } from "@/components/ui/loading";
import {
  QUERY_CONTINUE_ANALYSIS,
  QUERY_RESET,
  ROUTE_HOME_NEW_ANALYSIS,
} from "@/constants/routes";
import { formatJobRoleLabel } from "../_utils/format-job-role-label";
import { resumeQueryOptions } from "@/lib/query/query-options";
import type { ResumeData } from "@/types/resume";

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
  needsUnlock: boolean;
  isAnalysisUnlocked: boolean;
  isLoadingResume: boolean;
  jobDescription: string;
  jobRole: string;
  analysisId: string | null;
  score: number | null;
  optimizedScore: number | null;
  matchedSkillsCount: number;
  hardSkills: MissingSkill[];
  softSkills: MissingSkill[];
  selectedHardSkills: string[];
  selectedSoftSkills: string[];
  setStep: (step: WizardStep) => void;
  setJobDescription: (value: string) => void;
  setJobRole: (value: string) => void;
  setAnalysisResult: (result: {
    analysisId: string;
    score: number;
    matchedSkillsCount: number;
    hardSkills: string[];
    softSkills: string[];
  }) => void;
  setOptimizedResumeData: (data: ResumeData | null) => void;
  setOptimizedScore: (value: number | null) => void;
  setNeedsUnlock: (value: boolean) => void;
  toggleSkill: (id: string) => void;
  setSelectedHardSkills: (skills: string[]) => void;
  setSelectedSoftSkills: (skills: string[]) => void;
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

function toMissingSkillsWithPrefix(
  prefix: "hard" | "soft",
  labels: string[]
): MissingSkill[] {
  return labels.map((label) => ({
    id: `${prefix}-${slugify(label)}`,
    label,
    selected: false,
  }));
}

const INITIAL_STATE = {
  step: 1 as WizardStep,
  resumeId: null as string | null,
  resumeData: null as ResumeData | null,
  optimizedResumeData: null as ResumeData | null,
  needsUnlock: false,
  jobDescription: "",
  jobRole: "",
  analysisId: null as string | null,
  score: null as number | null,
  optimizedScore: null as number | null,
  matchedSkillsCount: 0,
  hardSkills: [] as MissingSkill[],
  softSkills: [] as MissingSkill[],
  selectedHardSkills: [] as string[],
  selectedSoftSkills: [] as string[],
};

interface NewAnalysisProviderProps {
  children: ReactNode;
  initialContinueId?: string | null;
}

export function NewAnalysisProvider({
  children,
  initialContinueId = null,
}: NewAnalysisProviderProps) {
  const searchParams = useSearchParams();

  const router = useRouter();

  const continueAnalysisId =
    searchParams.get(QUERY_CONTINUE_ANALYSIS) ?? initialContinueId ?? null;

  const [hasFinishedContinueLoad, setHasFinishedContinueLoad] = useState(false);

  const continueLoadStartedRef = useRef(false);
  const lastLoadedContinueIdRef = useRef<string | null>(null);

  const [step, setStep] = useState<WizardStep>(INITIAL_STATE.step);

  const {
    data: resumeQueryData,
    isPending: isResumeQueryPending,
    refetch: refetchResume,
  } = useQuery({
    ...resumeQueryOptions,
    enabled: step >= 2,
  });

  const resumeId = step >= 2 ? (resumeQueryData?.resumeId ?? null) : null;
  const resumeData = step >= 2 ? (resumeQueryData?.data ?? null) : null;
  const isLoadingResume = step >= 2 && isResumeQueryPending;
  const [jobDescription, setJobDescription] = useState(
    INITIAL_STATE.jobDescription
  );
  const [jobRole, setJobRole] = useState(INITIAL_STATE.jobRole);
  const [analysisId, setAnalysisId] = useState<string | null>(
    INITIAL_STATE.analysisId
  );
  const [score, setScore] = useState<number | null>(INITIAL_STATE.score);
  const [matchedSkillsCount, setMatchedSkillsCount] = useState<number>(
    INITIAL_STATE.matchedSkillsCount
  );
  const [hardSkills, setHardSkills] = useState<MissingSkill[]>(
    INITIAL_STATE.hardSkills
  );
  const [softSkills, setSoftSkills] = useState<MissingSkill[]>(
    INITIAL_STATE.softSkills
  );
  const [selectedHardSkills, setSelectedHardSkills] = useState<string[]>(
    INITIAL_STATE.selectedHardSkills
  );
  const [selectedSoftSkills, setSelectedSoftSkills] = useState<string[]>(
    INITIAL_STATE.selectedSoftSkills
  );
  const [optimizedResumeData, setOptimizedResumeData] =
    useState<ResumeData | null>(INITIAL_STATE.optimizedResumeData);
  const [optimizedScore, setOptimizedScore] = useState<number | null>(
    INITIAL_STATE.optimizedScore
  );
  const [needsUnlock, setNeedsUnlock] = useState(INITIAL_STATE.needsUnlock);
  const isAnalysisUnlocked = !needsUnlock;

  function setAnalysisResult(result: {
    analysisId: string;
    score: number;
    matchedSkillsCount: number;
    hardSkills: string[];
    softSkills: string[];
  }) {
    setAnalysisId(result.analysisId);
    setScore(result.score);
    setMatchedSkillsCount(result.matchedSkillsCount);
    setHardSkills(toMissingSkillsWithPrefix("hard", result.hardSkills));
    setSoftSkills(toMissingSkillsWithPrefix("soft", result.softSkills));
  }

  function toggleSkill(id: string) {
    if (id.startsWith("hard-")) {
      setHardSkills((prev) =>
        prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
      );
    } else {
      setSoftSkills((prev) =>
        prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
      );
    }
  }

  async function refreshResume() {
    await refetchResume();
  }

  const reset = useCallback(() => {
    lastLoadedContinueIdRef.current = null;
    continueLoadStartedRef.current = false;
    setHasFinishedContinueLoad(false);
    setStep(INITIAL_STATE.step);
    setJobDescription(INITIAL_STATE.jobDescription);
    setJobRole(INITIAL_STATE.jobRole);
    setAnalysisId(INITIAL_STATE.analysisId);
    setScore(INITIAL_STATE.score);
    setMatchedSkillsCount(INITIAL_STATE.matchedSkillsCount);
    setHardSkills(INITIAL_STATE.hardSkills);
    setSoftSkills(INITIAL_STATE.softSkills);
    setSelectedHardSkills(INITIAL_STATE.selectedHardSkills);
    setSelectedSoftSkills(INITIAL_STATE.selectedSoftSkills);
    setOptimizedResumeData(INITIAL_STATE.optimizedResumeData);
    setOptimizedScore(INITIAL_STATE.optimizedScore);
    setNeedsUnlock(INITIAL_STATE.needsUnlock);
  }, []);

  useEffect(() => {
    const resetParam = searchParams.get(QUERY_RESET);
    if (resetParam) {
      router.replace(ROUTE_HOME_NEW_ANALYSIS);
      queueMicrotask(reset);
    }
  }, [searchParams, reset, router]);

  useEffect(() => {
    if (
      !continueAnalysisId ||
      continueAnalysisId === lastLoadedContinueIdRef.current
    )
      return;
    queueMicrotask(() => {
      setHasFinishedContinueLoad(false);
      continueLoadStartedRef.current = false;
    });
  }, [continueAnalysisId]);

  useEffect(() => {
    if (
      !continueAnalysisId ||
      hasFinishedContinueLoad ||
      continueLoadStartedRef.current
    )
      return;

    continueLoadStartedRef.current = true;

    getAnalysisById(continueAnalysisId).then((result) => {
      if (!result.success || !result.data) {
        setHasFinishedContinueLoad(true);
        router.replace(ROUTE_HOME_NEW_ANALYSIS);
        return;
      }

      const analysis = result.data;
      const job = analysis.jobSnapshot;
      const status = analysis.status ?? "pending";

      setJobRole(formatJobRoleLabel(job.title, job.company));

      setAnalysisResult({
        analysisId: analysis.id,
        score: analysis.score,
        matchedSkillsCount: analysis.matchedSkillsCount,
        hardSkills: analysis.missingSkills.hard,
        softSkills: analysis.missingSkills.soft,
      });

      setOptimizedScore(analysis.optimizedScore ?? null);

      if (
        (status === "completed" || status === "pending_payment") &&
        analysis.optimizedResumeData
      ) {
        setOptimizedResumeData(analysis.optimizedResumeData);
        setNeedsUnlock(status === "pending_payment");
        setStep(3);
      } else {
        setStep(2);
      }

      lastLoadedContinueIdRef.current = continueAnalysisId;
      setHasFinishedContinueLoad(true);
      router.replace(ROUTE_HOME_NEW_ANALYSIS);
    });
  }, [continueAnalysisId, hasFinishedContinueLoad, router]);

  const hasResetParam = searchParams.get(QUERY_RESET) != null;
  const isWaitingForContinueLoad =
    Boolean(continueAnalysisId) && (step === 1 || !hasFinishedContinueLoad);

  if (hasResetParam || isWaitingForContinueLoad) {
    return <Loading className="min-h-0 flex-1" />;
  }

  return (
    <NewAnalysisContext.Provider
      value={{
        step,
        resumeId,
        resumeData,
        optimizedResumeData,
        needsUnlock,
        isAnalysisUnlocked,
        isLoadingResume,
        jobDescription,
        jobRole,
        analysisId,
        score,
        optimizedScore,
        matchedSkillsCount,
        hardSkills,
        softSkills,
        selectedHardSkills,
        selectedSoftSkills,
        setStep,
        setJobDescription,
        setJobRole,
        setAnalysisResult,
        setOptimizedResumeData,
        setOptimizedScore,
        setNeedsUnlock,
        toggleSkill,
        setSelectedHardSkills,
        setSelectedSoftSkills,
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
