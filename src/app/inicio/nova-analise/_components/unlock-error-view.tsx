import { Button } from "@/components/ui/button";

export interface UnlockErrorViewProps {
  errorMessage: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export function UnlockErrorView({
  errorMessage,
  onClose,
  onRetry,
}: UnlockErrorViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-small text-destructive">{errorMessage}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" size="brand" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="brand" size="brand" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
