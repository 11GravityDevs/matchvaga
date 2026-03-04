"use client";

import { useEffect, useRef } from "react";

import { trackCheckoutCompletedEvent } from "@/lib/analytics/posthog-events";

interface CheckoutSuccessTrackerProps {
  sessionId: string | undefined;
}

export function CheckoutSuccessTracker({
  sessionId,
}: CheckoutSuccessTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    trackCheckoutCompletedEvent(sessionId);
  }, [sessionId]);

  return null;
}
