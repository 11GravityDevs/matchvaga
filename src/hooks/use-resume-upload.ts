"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useOnboardingContext } from "@/contexts/onboarding-context";

import type { SelectedFileInfo } from "@/contexts/onboarding-context";

export interface UseResumeUploadReturn {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  isUploading: boolean;
  selectedFile: SelectedFileInfo | null;
  uploadFile: (file: File) => Promise<void>;
  uploadFromPaste: (text: string) => void;
  analyze: () => Promise<void>;
}

export function useResumeUpload(): UseResumeUploadReturn {
  const router = useRouter();
  const {
    resumeContent,
    setResumeContent,
    isUploading,
    selectedFile,
    setSelectedFile,
    setIsUploading,
  } = useOnboardingContext();

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setSelectedFile({ name: file.name, size: file.size });
        setResumeContent("");
      } finally {
        setIsUploading(false);
      }
    },
    [setIsUploading, setSelectedFile, setResumeContent]
  );

  const uploadFromPaste = useCallback(
    (text: string) => {
      setResumeContent(text);
    },
    [setResumeContent]
  );

  const analyze = useCallback(async () => {
    if (!resumeContent.trim() && !selectedFile) return;

    // TODO: Call API to analyze resume
    // For now, navigate to verify step
    router.push("/onboarding/verify");
  }, [resumeContent, selectedFile, router]);

  return {
    resumeContent,
    setResumeContent,
    isUploading,
    selectedFile,
    uploadFile,
    uploadFromPaste,
    analyze,
  };
}
