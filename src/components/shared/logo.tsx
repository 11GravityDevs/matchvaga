import Link from "next/link";
import { FileSearch } from "lucide-react";

import { BrandName } from "@/components/shared/brand-name";
import { cn } from "@/utils/style";

interface LogoProps {
  className?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  variant?: "default" | "light";
  href?: string;
}

const logoContent = (
  isLight: boolean,
  iconContainerClassName: string | undefined,
  iconClassName: string | undefined,
  textClassName: string | undefined
) => (
  <>
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg bg-accent-brand",
        iconContainerClassName
      )}
    >
      <FileSearch
        className={cn(
          "h-4 w-4 text-primary-foreground",
          isLight && "text-white",
          iconClassName
        )}
      />
    </div>
    <BrandName
      className={cn(
        "text-base font-bold text-foreground",
        isLight && "text-white",
        textClassName
      )}
      accentClassName={isLight ? "text-white" : undefined}
    />
  </>
);

export function Logo({
  className,
  iconContainerClassName,
  iconClassName,
  textClassName,
  variant = "default",
  href,
}: LogoProps) {
  const isLight = variant === "light";
  const content = logoContent(
    isLight,
    iconContainerClassName,
    iconClassName,
    textClassName
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          className
        )}
        aria-label="MatchVaga - início"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>{content}</div>
  );
}
