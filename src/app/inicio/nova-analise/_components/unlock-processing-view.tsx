import { CircleCheck, Loader, LockOpen } from "lucide-react";

export function UnlockProcessingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-7 py-12">
      <div className="relative flex size-[72px] items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-accent-brand" />
        <LockOpen className="size-7 text-primary" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base font-semibold text-foreground">
          Desbloqueando seu currículo...
        </p>
        <p className="text-sm text-muted-foreground">
          Isso pode levar alguns segundos
        </p>
      </div>
      <div className="flex w-full flex-col gap-2.5 px-8">
        <div className="flex items-center gap-2.5">
          <CircleCheck className="size-[18px] shrink-0 text-[#16A34A]" />
          <span className="text-sm font-medium text-foreground">
            Pagamento confirmado
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <CircleCheck className="size-[18px] shrink-0 text-[#16A34A]" />
          <span className="text-sm font-medium text-foreground">
            Crédito adicionado
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Loader className="size-[18px] shrink-0 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Gerando currículo otimizado...
          </span>
        </div>
      </div>
    </div>
  );
}
