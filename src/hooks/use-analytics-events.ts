import { useCallback } from "react";

import { useAuthContext } from "@/contexts/auth-context";
import {
  trackLandingFinalCtaClickedEvent,
  trackLandingHeroPrimaryCtaClickedEvent,
  trackLandingNavbarCtaClickedEvent,
} from "@/lib/analytics/posthog-events";

export const useAnalyticsEvents = () => {
  const { isLoggedIn } = useAuthContext();

  const trackLandingHeroPrimaryCtaClicked = useCallback(() => {
    trackLandingHeroPrimaryCtaClickedEvent(isLoggedIn);
  }, [isLoggedIn]);

  const trackLandingNavbarCtaClicked = useCallback(() => {
    trackLandingNavbarCtaClickedEvent(isLoggedIn);
  }, [isLoggedIn]);

  const trackLandingFinalCtaClicked = useCallback(() => {
    trackLandingFinalCtaClickedEvent(isLoggedIn);
  }, [isLoggedIn]);

  return {
    trackLandingHeroPrimaryCtaClicked,
    trackLandingNavbarCtaClicked,
    trackLandingFinalCtaClicked,
  };
};
