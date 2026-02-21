import { cn } from "@/utils/style";

const DEFAULT_LABEL_CLASS = "text-[13px] font-medium text-foreground";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
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
      <label
        htmlFor={htmlFor}
        className={labelClassName ?? DEFAULT_LABEL_CLASS}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
