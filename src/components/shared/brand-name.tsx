import { cn } from "@/utils/style";

interface BrandNameProps {
  className?: string;
  accentClassName?: string;
}

export function BrandName({
  className,
  accentClassName = "text-accent-brand",
}: BrandNameProps) {
  return (
    <span className={cn("inline", className)}>
      Match<span className={accentClassName}>Vaga</span>
    </span>
  );
}
