import posthog from "posthog-js";

const POSTHOG_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

if (!POSTHOG_TOKEN) {
  throw new Error("NEXT_PUBLIC_POSTHOG_TOKEN is not set");
}

posthog.init(POSTHOG_TOKEN, {
  api_host: "/ph",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
});
