import { X } from "lucide-react";

import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/utils/style";

interface SharedModalHeaderProps {
  title: string;
  canClose: boolean;
}

export function SharedModalHeader({ title, canClose }: SharedModalHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-foreground">{title}</span>
        <DialogClose asChild>
          <button
            type="button"
            disabled={!canClose}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors",
              canClose
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "cursor-not-allowed text-muted-foreground/30"
            )}
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </div>
      <div className="h-px bg-border" />
    </>
  );
}
