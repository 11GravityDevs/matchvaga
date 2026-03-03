"use client";

import type { ToastOptions } from "react-toastify";
import { toast } from "react-toastify";

type ToastNotificationVariant = "success" | "error" | "warning";

interface ShowToastNotificationParams {
  message: string;
  variant?: ToastNotificationVariant;
  options?: ToastOptions;
}

interface UseToastNotificationResult {
  showToastNotification: (params: ShowToastNotificationParams) => void;
  showSuccessToastNotification: (
    message: string,
    options?: ToastOptions
  ) => void;
  showErrorToastNotification: (message: string, options?: ToastOptions) => void;
  showWarningToastNotification: (
    message: string,
    options?: ToastOptions
  ) => void;
}

export const useToastNotification = (): UseToastNotificationResult => {
  const showToastNotification = ({
    message,
    variant = "success",
    options,
  }: ShowToastNotificationParams): void => {
    const toastOptions: ToastOptions = {
      ...options,
    };

    switch (variant) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "warning":
        toast.warning(message, toastOptions);
        break;
    }
  };

  const showSuccessToastNotification = (
    message: string,
    options?: ToastOptions
  ): void => {
    showToastNotification({ message, variant: "success", options });
  };

  const showErrorToastNotification = (
    message: string,
    options?: ToastOptions
  ): void => {
    showToastNotification({ message, variant: "error", options });
  };

  const showWarningToastNotification = (
    message: string,
    options?: ToastOptions
  ): void => {
    showToastNotification({ message, variant: "warning", options });
  };

  return {
    showToastNotification,
    showSuccessToastNotification,
    showErrorToastNotification,
    showWarningToastNotification,
  };
};
