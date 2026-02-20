import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const loadingVariants = cva("flex w-full items-center justify-center", {
  variants: {
    variant: {
      full: "min-h-screen",
      inline: "min-h-[200px]",
    },
  },
  defaultVariants: {
    variant: "full",
  },
});

const spinnerSizes = {
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-10 w-10 border-2",
} as const;

interface LoadingProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  size?: keyof typeof spinnerSizes;
}

export function Loading({
  variant,
  size = "md",
  className,
  ...props
}: LoadingProps) {
  return (
    <div
      className={cn(loadingVariants({ variant }), className)}
      role="status"
      aria-label="Carregando"
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          spinnerSizes[size]
        )}
        aria-hidden
      />
    </div>
  );
}
