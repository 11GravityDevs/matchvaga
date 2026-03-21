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
  paymentProvider?: "credit-card" | "pix";
  paymentId?: string;
}

export function CheckoutSuccessTracker({
  sessionId,
  paymentProvider = "credit-card",
  paymentId,
}: CheckoutSuccessTrackerProps) {
  const queryClient = useQueryClient();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const eventId = paymentProvider === "pix" ? paymentId : sessionId;
    if (!eventId || hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    trackCheckoutCompletedEvent(eventId, paymentProvider);

    const timeoutId = setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY_ANALYSES });
    }, CHECKOUT_SUCCESS_INVALIDATE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [sessionId, paymentId, paymentProvider, queryClient]);

  return null;
}
