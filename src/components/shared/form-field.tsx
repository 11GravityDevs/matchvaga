import type { ReactNode } from "react";

import { cn } from "@/utils/style";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  className?: string;
  labelClassName?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  className,
  labelClassName,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className={labelClassName ?? "text-form-label"}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
