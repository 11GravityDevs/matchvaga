import Link from "next/link";

import { FileSearch } from "lucide-react";

import { BrandName } from "@/components/shared/brand-name";
import { cn } from "@/utils/style";

interface OnboardingTopBarProps {
  className?: string;
  showSkipButton?: boolean;
  onSkip?: () => void;
}

export function OnboardingTopBar({
  className,
  showSkipButton = false,
  onSkip,
}: OnboardingTopBarProps) {
  const shouldShowSkip = showSkipButton && typeof onSkip === "function";

  return (
    <header
      className={cn(
        "flex h-16 w-full items-center justify-between border-b border-border bg-card px-8",
        className
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-foreground no-underline hover:opacity-90"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-brand">
          <FileSearch className="h-4 w-4 text-primary-foreground" />
        </div>
        <BrandName className="text-lg font-bold" />
      </Link>
      {shouldShowSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Pular
        </button>
      )}
    </header>
  );
}
