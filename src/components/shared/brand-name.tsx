import { cn } from "@/utils/style";

interface BrandNameProps {
  className?: string;
}

export function BrandName({ className }: BrandNameProps) {
  return (
    <span className={cn("inline", className)}>
      Match<span className="text-accent-brand">Vaga</span>
    </span>
  );
}
