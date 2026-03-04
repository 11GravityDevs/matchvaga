import posthog from "posthog-js";

const POSTHOG_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

if (typeof window !== "undefined" && POSTHOG_TOKEN) {
  posthog.init(POSTHOG_TOKEN, {
    api_host: "/ph",
    ui_host: "https://us.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    opt_out_capturing_by_default: true,
    capture_performance: {
      web_vitals: true,
    },
  });

  const consentStatus = window.localStorage.getItem("cookie-consent");

  if (consentStatus === "accepted") {
    posthog.opt_in_capturing();
  }

  if (consentStatus === "declined") {
    posthog.opt_out_capturing();
  }
}
