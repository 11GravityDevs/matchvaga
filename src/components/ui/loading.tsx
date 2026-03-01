"use client";

import { useEffect, useState } from "react";
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

const DEFAULT_THINKING_INTERVAL_MS = 2500;

interface LoadingProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  size?: keyof typeof spinnerSizes;
  thinkingMessages?: string[];
}

export function Loading({
  variant,
  size = "lg",
  className,
  thinkingMessages,
  ...props
}: LoadingProps) {
  const hasThinkingMessages =
    Array.isArray(thinkingMessages) && thinkingMessages.length > 0;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (
      !hasThinkingMessages ||
      !thinkingMessages ||
      thinkingMessages.length <= 1
    )
      return;
    const length = thinkingMessages.length;
    const id = setInterval(() => {
      setCurrentMessageIndex((i) => (i + 1) % length);
    }, DEFAULT_THINKING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasThinkingMessages, thinkingMessages]);

  const currentMessage = hasThinkingMessages
    ? thinkingMessages[
        Math.min(currentMessageIndex, thinkingMessages.length - 1)
      ]
    : null;

  return (
    <div
      className={cn(loadingVariants({ variant }), className, "flex-col gap-8")}
      role="status"
      aria-label={currentMessage ?? "Carregando"}
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

      {currentMessage !== null && (
        <p className="text-small text-muted-foreground" aria-live="polite">
          {currentMessage}
        </p>
      )}
    </div>
  );
}
