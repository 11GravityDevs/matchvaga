"use cache";

import type { MetadataRoute } from "next";

import { SITE_URL } from "@/constants/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/inicio/", "/onboarding/", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
