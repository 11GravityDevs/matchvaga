import { LockOpen } from "lucide-react";

export function UnlockLoadingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-7 py-12">
      <div className="relative flex size-[72px] items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-accent-brand" />
        <LockOpen className="size-7 text-primary" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base font-semibold text-foreground">
          Preparando pagamento...
        </p>
        <p className="text-sm text-muted-foreground">
          Isso pode levar alguns segundos
        </p>
      </div>
    </div>
  );
}
