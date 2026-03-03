"use client";

import type { ReactNode } from "react";
import { CheckCircle, CircleAlert, TriangleAlert } from "lucide-react";
import { Flip, ToastContainer } from "react-toastify";

interface ToastProviderProps {
  children?: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        icon={({ type }) => {
          switch (type) {
            case "error":
              return <CircleAlert className="h-5 w-5 text-white" />;
            case "success":
              return <CheckCircle className="h-5 w-5 text-white" />;
            case "warning":
              return <TriangleAlert className="h-5 w-5 text-white" />;
            default:
              return null;
          }
        }}
        transition={Flip}
      />
    </>
  );
};
