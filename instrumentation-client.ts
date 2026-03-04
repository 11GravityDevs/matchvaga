import posthog from "posthog-js";

const POSTHOG_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (typeof window !== "undefined" && POSTHOG_TOKEN && POSTHOG_HOST) {
  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    opt_out_capturing_by_default: true,
    defaults: "2026-01-30",
  });

  const consentStatus = window.localStorage.getItem("cookie-consent");

  if (consentStatus === "accepted") {
    posthog.opt_in_capturing();
  }

  if (consentStatus === "declined") {
    posthog.opt_out_capturing();
  }
}
