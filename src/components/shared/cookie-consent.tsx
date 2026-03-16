"use client";

import { useEffect, useState } from "react";

import { Cookie } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";

import { trackEvent } from "@/lib/analytics/posthog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent";

type ConsentStatus = "accepted" | "declined";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "accepted") {
      posthog.opt_in_capturing();
    }

    if (!stored) {
      queueMicrotask(() => setIsVisible(true));
    }
  }, []);

  function handleConsent(status: ConsentStatus) {
    localStorage.setItem(STORAGE_KEY, status);

    if (status === "accepted") {
      posthog.opt_in_capturing();
      trackEvent("cookie_consent_accepted", {});
    } else {
      posthog.opt_out_capturing();
      trackEvent("cookie_consent_declined", {});
    }

    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Consentimento de cookies"
      className="animate-fade-up fixed inset-x-0 bottom-0 z-50 p-4"
    >
      <div className="mx-auto flex max-w-cookie-content flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <p className="text-small-semibold text-foreground">
              Usamos cookies
            </p>
            <p className="text-small text-muted-foreground">
              Utilizamos cookies analíticos (PostHog) para entender como a
              plataforma é usada e melhorar nossos serviços. Para mais detalhes,
              consulte nossa{" "}
              <Link
                href="/politica-de-privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-brand underline underline-offset-4 hover:text-accent-brand-hover"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
          <Button variant="outline" onClick={() => handleConsent("declined")}>
            Recusar
          </Button>
          <Button variant="brand" onClick={() => handleConsent("accepted")}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
