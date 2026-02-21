import type { ReactNode } from "react";

import { cn } from "@/utils/style";
import { FORM_LABEL_CLASS } from "@/constants/design-tokens";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className={labelClassName ?? FORM_LABEL_CLASS}>
        {label}
      </label>
      {children}
    </div>
  );
}
