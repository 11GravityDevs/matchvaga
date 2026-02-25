"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { uploadResume } from "@/app/actions/resume";
import { QUERY_KEY_RESUME } from "@/constants/query-keys";
import { ROUTE_ONBOARDING_VERIFY } from "@/constants/routes";
import {
  useOnboardingContext,
  type SelectedFileInfo,
} from "../../_contexts/onboarding-context";

export interface UseResumeUploadReturn {
  resumeContent: string;
  setResumeContent: (content: string) => void;
  isUploading: boolean;
  uploadError: string | null;
  selectedFile: SelectedFileInfo | null;
  uploadFile: (file: File) => void;
  uploadFromPaste: (text: string) => void;
  analyze: () => Promise<void>;
}

export function useResumeUpload(): UseResumeUploadReturn {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    resumeContent,
    setResumeContent,
    selectedFile,
    setSelectedFile,
    setResumeId,
    setParsedData,
  } = useOnboardingContext();

  const {
    mutateAsync: uploadMutation,
    isPending: isUploading,
    error: uploadError,
  } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadResume(formData);
      if (!result.success) {
        throw new Error(result.error ?? "Erro ao processar currículo.");
      }
      return result;
    },
    onSuccess: (result) => {
      if (result.resumeId && result.parsedData) {
        queryClient.setQueryData(QUERY_KEY_RESUME, {
          success: true,
          resumeId: result.resumeId,
          data: result.parsedData,
        });
        setResumeId(result.resumeId);
        setParsedData(result.parsedData);
        router.push(ROUTE_ONBOARDING_VERIFY);
      }
    },
  });

  function uploadFile(file: File) {
    setSelectedFile({ name: file.name, size: file.size, file });
    setResumeContent("");
  }

  function uploadFromPaste(text: string) {
    setResumeContent(text);
    setSelectedFile(null);
  }

  async function analyze() {
    if (!selectedFile) return;
    await uploadMutation(selectedFile.file);
  }

  return {
    resumeContent,
    setResumeContent,
    isUploading,
    uploadError:
      uploadError instanceof Error
        ? uploadError.message
        : uploadError
          ? String(uploadError)
          : null,
    selectedFile,
    uploadFile,
    uploadFromPaste,
    analyze,
  };
}
