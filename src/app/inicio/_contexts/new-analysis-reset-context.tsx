"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  QUERY_CONTINUE_ANALYSIS,
  ROUTE_HOME_DASHBOARD,
  ROUTE_HOME_NEW_ANALYSIS,
  ROUTE_HOME_RESUME,
} from "@/constants/routes";

const ROUTES_THAT_TRIGGER_RESET = [
  ROUTE_HOME_DASHBOARD,
  ROUTE_HOME_RESUME,
] as const;

interface NewAnalysisResetContextValue {
  resetKey: number;
}

const NewAnalysisResetContext =
  createContext<NewAnalysisResetContextValue | null>(null);

interface NewAnalysisResetProviderProps {
  children: ReactNode;
}

export function NewAnalysisResetProvider({
  children,
}: NewAnalysisResetProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathnameRef = useRef(pathname);
  const [resetKey, setResetKey] = useState(0);

  const incrementResetKey = useCallback(() => {
    setResetKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    const hasContinue = searchParams.get(QUERY_CONTINUE_ANALYSIS) != null;
    const cameFromTriggerRoute = (
      ROUTES_THAT_TRIGGER_RESET as readonly string[]
    ).includes(prevPathname);
    const navigatedToNewAnalysis = pathname === ROUTE_HOME_NEW_ANALYSIS;

    if (navigatedToNewAnalysis && !hasContinue && cameFromTriggerRoute) {
      queueMicrotask(incrementResetKey);
    }
  }, [pathname, searchParams, incrementResetKey]);

  return (
    <NewAnalysisResetContext.Provider value={{ resetKey }}>
      {children}
    </NewAnalysisResetContext.Provider>
  );
}

export function useNewAnalysisReset() {
  const ctx = useContext(NewAnalysisResetContext);
  return ctx?.resetKey ?? 0;
}
