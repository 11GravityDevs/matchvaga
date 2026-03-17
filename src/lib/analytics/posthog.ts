import posthog from "posthog-js";

type AnalyticsEventName =
  | "landing_viewed"
  | "landing_hero_primary_cta_clicked"
  | "landing_navbar_cta_clicked"
  | "landing_final_cta_clicked"
  | "login_email_submitted"
  | "login_google_submitted"
  | "auth_login_succeeded"
  | "auth_login_failed"
  | "pricing_viewed"
  | "pricing_package_selected"
  | "checkout_started"
  | "checkout_completed"
  | "cookie_consent_accepted"
  | "cookie_consent_declined";

export interface AnalyticsEventProperties {
  landing_viewed: Record<string, never>;
  landing_hero_primary_cta_clicked: {
    is_logged_in: boolean;
  };
  landing_navbar_cta_clicked: {
    is_logged_in: boolean;
  };
  landing_final_cta_clicked: {
    is_logged_in: boolean;
  };
  login_email_submitted: {
    method: "email";
  };
  login_google_submitted: {
    method: "google";
  };
  auth_login_succeeded: {
    method: "email" | "google";
  };
  auth_login_failed: {
    method: "email" | "google";
    error_type: string;
  };
  pricing_viewed: Record<string, never>;
  pricing_package_selected: {
    package_id: string;
    credits: number;
    price_centavos: number;
  };
  checkout_started: {
    package_id: string;
    price_centavos: number;
    currency: "BRL";
    provider?: "stripe" | "pix";
  };
  checkout_completed: {
    session_id: string;
    provider?: "stripe" | "pix";
  };
  cookie_consent_accepted: Record<string, never>;
  cookie_consent_declined: Record<string, never>;
}

export const trackEvent = <TName extends AnalyticsEventName>(
  eventName: TName,
  properties: AnalyticsEventProperties[TName]
): void => {
  posthog.capture(eventName, properties);
};

export const identifyUser = (
  distinctId: string,
  traits?: Record<string, unknown>
): void => {
  posthog.identify(distinctId, traits);
};

export const resetUser = (): void => {
  posthog.reset();
};
