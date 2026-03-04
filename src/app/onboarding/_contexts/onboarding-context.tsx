"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface SelectedFileInfo {
  name: string;
  size: number;
  file: File;
}

interface OnboardingContextValue {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  selectedFile: SelectedFileInfo | null;
  setSelectedFile: (file: SelectedFileInfo | null) => void;
  skippedUpload: boolean;
  setSkippedUpload: (value: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [resumeContent, setResumeContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFileInfo | null>(
    null
  );
  const [skippedUpload, setSkippedUpload] = useState(false);

  return (
    <OnboardingContext.Provider
      value={{
        resumeContent,
        setResumeContent,
        selectedFile,
        setSelectedFile,
        skippedUpload,
        setSkippedUpload,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error(
      "useOnboardingContext must be used within OnboardingProvider"
    );
  }
  return ctx;
}
