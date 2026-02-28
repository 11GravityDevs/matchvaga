"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getAnalysisById } from "@/app/actions/analysis";
import { Loading } from "@/components/ui/loading";
import {
  QUERY_CONTINUE_ANALYSIS,
  ROUTE_DASHBOARD_NEW_ANALYSIS,
} from "@/constants/routes";
import { useNewAnalysis } from "../_contexts/new-analysis-context";

interface ContinueAnalysisLoaderProps {
  children: React.ReactNode;
  initialContinueId?: string | null;
}

export function ContinueAnalysisLoader({
  children,
  initialContinueId = null,
}: ContinueAnalysisLoaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const continueId = searchParams.get(QUERY_CONTINUE_ANALYSIS);
  const [continueApplied, setContinueApplied] = useState(false);
  const loadedRef = useRef(false);
  const { setAnalysisResult, setStep, setJobDescription, setJobRole } =
    useNewAnalysis();

  const inContinueMode = Boolean(continueId ?? initialContinueId);
  const showLoading = inContinueMode && !continueApplied;

  useEffect(() => {
    if (!continueId || continueApplied || loadedRef.current) return;
    loadedRef.current = true;

    getAnalysisById(continueId).then((result) => {
      if (!result.success || !result.data) {
        setContinueApplied(true);
        router.replace(ROUTE_DASHBOARD_NEW_ANALYSIS);
        return;
      }
      const a = result.data;
      const job = a.job_snapshot;
      setJobDescription(job.rawText);
      setJobRole(job.title);
      setAnalysisResult({
        analysisId: a.id,
        score: a.score,
        matchedSkills: a.matched_skills,
        technicalSkills: a.missing_skills.technical,
        behavioralSkills: a.missing_skills.behavioral,
      });
      setStep(2);
      setContinueApplied(true);
      router.replace(ROUTE_DASHBOARD_NEW_ANALYSIS);
    });
  }, [
    continueId,
    continueApplied,
    router,
    setAnalysisResult,
    setJobDescription,
    setJobRole,
    setStep,
  ]);

  if (showLoading) {
    return <Loading className="min-h-0 flex-1" />;
  }

  return <>{children}</>;
}
