"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ResumeData } from "@/types/resume";

export interface SelectedFileInfo {
  name: string;
  size: number;
  file: File;
}

interface OnboardingContextValue {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  selectedFile: SelectedFileInfo | null;
  setSelectedFile: (file: SelectedFileInfo | null) => void;
  resumeId: string | null;
  setResumeId: (id: string | null) => void;
  parsedData: ResumeData | null;
  setParsedData: (data: ResumeData | null) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [resumeContent, setResumeContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFileInfo | null>(
    null
  );
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);

  return (
    <OnboardingContext.Provider
      value={{
        resumeContent,
        setResumeContent,
        isUploading,
        setIsUploading,
        selectedFile,
        setSelectedFile,
        resumeId,
        setResumeId,
        parsedData,
        setParsedData,
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
