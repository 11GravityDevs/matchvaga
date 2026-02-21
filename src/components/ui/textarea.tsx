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
        form: "h-25 resize-none rounded-md border-input bg-background focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30 text-[13px] leading-normal text-foreground",
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
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Textarea };
