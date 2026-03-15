"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  QUERY_KEY_ANALYSES,
  QUERY_KEY_CURRENT_USER_DISPLAY,
} from "@/constants/query-keys";
import { trackCheckoutCompletedEvent } from "@/lib/analytics/posthog-events";

const CHECKOUT_SUCCESS_INVALIDATE_DELAY_MS = 2000;

interface CheckoutSuccessTrackerProps {
  sessionId: string | undefined;
}

export function CheckoutSuccessTracker({
  sessionId,
}: CheckoutSuccessTrackerProps) {
  const queryClient = useQueryClient();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    trackCheckoutCompletedEvent(sessionId);

    const timeoutId = setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY_ANALYSES });
    }, CHECKOUT_SUCCESS_INVALIDATE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [sessionId, queryClient]);

  return null;
}
