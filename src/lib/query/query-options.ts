import { queryOptions } from "@tanstack/react-query";

import { getAnalysesForUser } from "@/app/actions/analysis";
import type { AnalysisRow } from "@/app/actions/analysis";
import { getResumeForUser } from "@/app/actions/resume";
import type { GetResumeForUserResult } from "@/app/actions/resume";
import { getCurrentUserDisplay } from "@/app/actions/user";
import type { GetCurrentUserDisplayResult } from "@/app/actions/user";
import {
  QUERY_KEY_ANALYSES,
  QUERY_KEY_CURRENT_USER_DISPLAY,
  QUERY_KEY_RESUME,
} from "@/constants/query-keys";

const STALE_TIME = Number.POSITIVE_INFINITY;

async function resumeQueryFn(): Promise<GetResumeForUserResult> {
  const result = await getResumeForUser();

  if (!result.success) {
    throw new Error(result.error ?? "Erro ao carregar currículo.");
  }

  return result;
}

async function currentUserDisplayQueryFn(): Promise<GetCurrentUserDisplayResult> {
  const result = await getCurrentUserDisplay();

  if (!result.success) {
    throw new Error(result.error ?? "Erro ao carregar dados do usuário.");
  }

  return result;
}

async function analysesQueryFn(): Promise<AnalysisRow[]> {
  const result = await getAnalysesForUser();

  if (!result.success) {
    throw new Error(result.error ?? "Erro ao carregar análises.");
  }

  return result.data ?? [];
}

export const resumeQueryOptions = queryOptions({
  queryKey: QUERY_KEY_RESUME,
  queryFn: resumeQueryFn,
  staleTime: STALE_TIME,
});

export const analysesQueryOptions = queryOptions({
  queryKey: QUERY_KEY_ANALYSES,
  queryFn: analysesQueryFn,
  staleTime: STALE_TIME,
});

export const currentUserDisplayQueryOptions = queryOptions({
  queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
  queryFn: currentUserDisplayQueryFn,
  staleTime: STALE_TIME,
});
