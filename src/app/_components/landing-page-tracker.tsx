"use client";

import { useEffect, useRef } from "react";

import { trackLandingViewedEvent } from "@/lib/analytics/posthog-events";

export function LandingPageTracker() {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;

    hasTrackedRef.current = true;

    trackLandingViewedEvent();
  }, []);

  return null;
}
