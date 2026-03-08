import { Logo } from "@/components/shared/logo";
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
      className={cn("flex w-full justify-center bg-background py-5", className)}
    >
      <div className="mx-auto flex w-full max-w-landing-content items-center justify-between">
        <Logo className="hover:opacity-90" textClassName="text-lg font-bold" />
        {shouldShowSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pular
          </button>
        )}
      </div>
    </header>
  );
}
