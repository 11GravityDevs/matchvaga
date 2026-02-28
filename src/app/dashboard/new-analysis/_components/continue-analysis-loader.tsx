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
}

export function ContinueAnalysisLoader({
  children,
}: ContinueAnalysisLoaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const continueId = searchParams.get(QUERY_CONTINUE_ANALYSIS);
  const [isLoading, setIsLoading] = useState(Boolean(continueId));
  const loadedRef = useRef(false);
  const { setAnalysisResult, setStep, setJobDescription, setJobRole } =
    useNewAnalysis();

  useEffect(() => {
    if (!continueId || loadedRef.current) return;
    loadedRef.current = true;

    getAnalysisById(continueId).then((result) => {
      if (!result.success || !result.data) {
        setIsLoading(false);
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
      setIsLoading(false);
      router.replace(ROUTE_DASHBOARD_NEW_ANALYSIS);
    });
  }, [
    continueId,
    router,
    setAnalysisResult,
    setJobDescription,
    setJobRole,
    setStep,
  ]);

  if (continueId && isLoading) {
    return <Loading className="min-h-0 flex-1" />;
  }

  return <>{children}</>;
}
