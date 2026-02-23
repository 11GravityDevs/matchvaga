import { FileSearch } from "lucide-react";

import { BrandName } from "@/components/shared/brand-name";
import { cn } from "@/utils/style";

interface LogoProps {
  className?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  variant?: "default" | "light";
}

export function Logo({
  className,
  iconContainerClassName,
  iconClassName,
  textClassName,
  variant = "default",
}: LogoProps) {
  const isLight = variant === "light";
  return (
    <div className={cn("flex items-center gap-2", className)}>
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
    </div>
  );
}
