import { Loader2 } from "lucide-react";

export function UnlockLoadingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <Loader2 className="size-10 animate-spin text-muted-foreground" />
      <p className="text-small text-muted-foreground">
        Preparando pagamento...
      </p>
    </div>
  );
}
