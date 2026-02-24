const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL =
  envSiteUrl && envSiteUrl.length > 0
    ? envSiteUrl.replace(/\/$/, "")
    : "http://localhost:3000";
