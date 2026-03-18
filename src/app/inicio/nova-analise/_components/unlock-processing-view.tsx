import { Loader2 } from "lucide-react";

export function UnlockProcessingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <Loader2 className="size-10 animate-spin text-accent-success" />
      <p className="text-center text-section-header text-foreground">
        Desbloqueando seu currículo...
      </p>
    </div>
  );
}
