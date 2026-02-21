import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/style";
import { Logo } from "../shared/logo";

const loadingVariants = cva("flex w-full items-center justify-center", {
  variants: {
    variant: {
      full: "min-h-screen",
      inline: "min-h-52",
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
  size = "lg",
  className,
  ...props
}: LoadingProps) {
  return (
    <div
      className={cn(loadingVariants({ variant }), className, "flex-col gap-8")}
      role="status"
      aria-label="Carregando"
      {...props}
    >
      <Logo
        iconContainerClassName="h-14 w-14 rounded-2xl"
        iconClassName="h-7 w-7"
        textClassName="text-3xl text-foreground"
      />
      <div
        className={cn(
          "animate-spin rounded-full border-accent-brand border-t-transparent",
          spinnerSizes[size]
        )}
        aria-hidden
      />
    </div>
  );
}
