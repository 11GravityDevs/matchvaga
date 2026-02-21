import { FileSearch } from "lucide-react";

import { BrandName } from "@/components/shared/brand-name";
import { cn } from "@/utils/style";

interface LogoProps {
  className?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({
  className,
  iconContainerClassName,
  iconClassName,
  textClassName,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg bg-accent-brand",
          iconContainerClassName
        )}
      >
        <FileSearch
          className={cn("h-4 w-4 text-primary-foreground", iconClassName)}
        />
      </div>
      <BrandName
        className={cn("text-base font-bold text-foreground", textClassName)}
      />
    </div>
  );
}
