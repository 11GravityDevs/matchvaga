import { cn } from "@/utils/style";

export function FormSectionSeparator({ className }: { className?: string }) {
  return (
    <div className={cn("py-6", className)} role="separator" aria-hidden>
      <div className="h-px w-full bg-border" />
    </div>
  );
}
