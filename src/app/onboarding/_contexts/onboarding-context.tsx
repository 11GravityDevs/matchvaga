"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface SelectedFileInfo {
  name: string;
  size: number;
}

interface OnboardingContextValue {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  selectedFile: SelectedFileInfo | null;
  setSelectedFile: (file: SelectedFileInfo | null) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [resumeContent, setResumeContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFileInfo | null>(
    null
  );

  return (
    <OnboardingContext.Provider
      value={{
        resumeContent,
        setResumeContent,
        isUploading,
        setIsUploading,
        selectedFile,
        setSelectedFile,
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
