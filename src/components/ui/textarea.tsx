import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/style";

const textareaVariants = cva(
  "flex field-sizing-content w-full border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "rounded-md border-input min-h-16 px-2.5 focus-visible:border-ring",
        form: "min-h-32 resize-none rounded-md border-input bg-background focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/30 text-[13px] leading-normal text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface TextareaProps
  extends
    React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {
  autoResize?: boolean;
}

function Textarea({
  className,
  variant,
  autoResize,
  value,
  onChange,
  ...props
}: TextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const resizeToFitContent = React.useCallback(() => {
    if (!autoResize || !textareaRef.current) {
      return;
    }

    const element = textareaRef.current;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [autoResize]);

  React.useEffect(() => {
    resizeToFitContent();
  }, [resizeToFitContent, value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    resizeToFitContent();
    onChange?.(event);
  };

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      className={cn(
        textareaVariants({ variant, className }),
        autoResize && "overflow-hidden"
      )}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Textarea };
