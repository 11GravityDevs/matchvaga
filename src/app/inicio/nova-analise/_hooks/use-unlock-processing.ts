"use client";

import { useEffect, useRef } from "react";

import { unlockAnalysis } from "@/app/actions/document-preview";
import type { UnlockAnalysisResult } from "@/app/actions/document-preview";
import {
  QUERY_KEY_ANALYSES,
  QUERY_KEY_CURRENT_USER_DISPLAY,
} from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";

import {
  UNLOCK_MAX_RETRIES,
  UNLOCK_RETRY_DELAY_MS,
  UNLOCK_ERROR_MAX_RETRIES,
} from "../_constants/unlock";

export interface UseUnlockProcessingCallbacks {
  onSuccess: (result: UnlockAnalysisResult) => void;
  onError: (message: string) => void;
}

export function useUnlockProcessing(
  analysisId: string,
  isProcessing: boolean,
  { onSuccess, onError }: UseUnlockProcessingCallbacks
) {
  const queryClient = useQueryClient();
  const attemptRef = useRef(0);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!isProcessing) return;

    attemptRef.current = 0;
    let cancelled = false;

    const runUnlock = async () => {
      const result = await unlockAnalysis(analysisId);

      if (cancelled) return;

      if (result.success) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY_ANALYSES });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
        });
        onSuccessRef.current(result);
        return;
      }

      attemptRef.current += 1;
      if (attemptRef.current < UNLOCK_MAX_RETRIES) {
        setTimeout(() => {
          if (!cancelled) void runUnlock();
        }, UNLOCK_RETRY_DELAY_MS);
      } else {
        onErrorRef.current(UNLOCK_ERROR_MAX_RETRIES);
      }
    };

    void runUnlock();

    return () => {
      cancelled = true;
    };
  }, [isProcessing, analysisId, queryClient]);
}
