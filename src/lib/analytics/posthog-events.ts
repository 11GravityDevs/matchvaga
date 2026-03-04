import { trackEvent } from "./posthog";
import { setPosthogLoginMethod } from "./posthog-login-method";

export const trackLandingViewedEvent = (): void => {
  trackEvent("landing_viewed", {});
};

export const trackLandingHeroPrimaryCtaClickedEvent = (
  isLoggedIn: boolean
): void => {
  trackEvent("landing_hero_primary_cta_clicked", {
    is_logged_in: isLoggedIn,
  });
};

export const trackLandingNavbarCtaClickedEvent = (
  isLoggedIn: boolean
): void => {
  trackEvent("landing_navbar_cta_clicked", {
    is_logged_in: isLoggedIn,
  });
};

export const trackLandingFinalCtaClickedEvent = (isLoggedIn: boolean): void => {
  trackEvent("landing_final_cta_clicked", {
    is_logged_in: isLoggedIn,
  });
};

export const trackLoginEmailSubmittedEvent = (): void => {
  setPosthogLoginMethod("email");
  trackEvent("login_email_submitted", { method: "email" });
};

export const trackLoginGoogleSubmittedEvent = (): void => {
  setPosthogLoginMethod("google");
  trackEvent("login_google_submitted", { method: "google" });
};

export const trackAuthLoginFailedEvent = (
  method: "email" | "google",
  errorType: string
): void => {
  trackEvent("auth_login_failed", { method, error_type: errorType });
};

export const trackPricingViewedEvent = (): void => {
  trackEvent("pricing_viewed", {});
};

export const trackPricingPackageSelectedEvent = (
  packageId: string,
  credits: number,
  priceCentavos: number
): void => {
  trackEvent("pricing_package_selected", {
    package_id: packageId,
    credits,
    price_centavos: priceCentavos,
  });
};

export const trackCheckoutStartedEvent = (
  packageId: string,
  priceCentavos: number
): void => {
  trackEvent("checkout_started", {
    package_id: packageId,
    price_centavos: priceCentavos,
    currency: "BRL",
  });
};

export const trackCheckoutCompletedEvent = (sessionId: string): void => {
  trackEvent("checkout_completed", { session_id: sessionId });
};
