"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { unlockAnalysis } from "@/app/actions/document-preview";
import {
  QUERY_KEY_ANALYSES,
  QUERY_KEY_CURRENT_USER_DISPLAY,
} from "@/constants/query-keys";
import { ROUTE_HOME_NEW_ANALYSIS } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";

const UNLOCK_RETRY_DELAY_MS = 2000;
const UNLOCK_MAX_RETRIES = 3;

interface CheckoutUnlockHandlerProps {
  analysisId: string;
}

export function CheckoutUnlockHandler({
  analysisId,
}: CheckoutUnlockHandlerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const attemptRef = useRef(0);
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );

  useEffect(() => {
    let cancelled = false;

    const runUnlock = async () => {
      const result = await unlockAnalysis(analysisId);

      if (cancelled) return;

      if (result.success) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY_ANALYSES });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEY_CURRENT_USER_DISPLAY,
        });
        setStatus("success");
        router.replace(`${ROUTE_HOME_NEW_ANALYSIS}?continue=${analysisId}`);
        return;
      }

      attemptRef.current += 1;
      if (attemptRef.current < UNLOCK_MAX_RETRIES) {
        setTimeout(() => {
          if (!cancelled) void runUnlock();
        }, UNLOCK_RETRY_DELAY_MS);
      } else {
        setStatus("error");
      }
    };

    void runUnlock();

    return () => {
      cancelled = true;
    };
  }, [analysisId, queryClient, router]);

  if (status === "pending") {
    return (
      <p className="text-small text-muted-foreground">
        Desbloqueando seu currículo...
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-small text-destructive">
        Não foi possível desbloquear automaticamente. Acesse Nova análise e
        tente novamente.
      </p>
    );
  }

  return null;
}
