"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { uploadResume } from "@/app/actions/resume";
import { ROUTE_ONBOARDING_VERIFY } from "@/constants/routes";
import {
  useOnboardingContext,
  type SelectedFileInfo,
} from "../../_contexts/onboarding-context";

export interface UseResumeUploadReturn {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  isUploading: boolean;
  selectedFile: SelectedFileInfo | null;
  uploadFile: (file: File) => void;
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
    setResumeId,
    setParsedData,
  } = useOnboardingContext();

  const uploadFile = useCallback(
    (file: File) => {
      setSelectedFile({ name: file.name, size: file.size, file });
      setResumeContent("");
    },
    [setSelectedFile, setResumeContent]
  );

  const uploadFromPaste = useCallback(
    (text: string) => {
      setResumeContent(text);
      setSelectedFile(null);
    },
    [setResumeContent, setSelectedFile]
  );

  const analyze = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile.file);

      const result = await uploadResume(formData);

      if (!result.success) {
        throw new Error(result.error ?? "Erro ao processar currículo.");
      }

      if (result.resumeId && result.parsedData) {
        setResumeId(result.resumeId);
        setParsedData(result.parsedData);
        router.push(ROUTE_ONBOARDING_VERIFY);
      }
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  }, [selectedFile, setIsUploading, setResumeId, setParsedData, router]);

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
