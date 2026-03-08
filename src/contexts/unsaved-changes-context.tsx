"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesContextValue {
  isDirty: boolean;
  setDirty: (value: boolean) => void;
  setOnBeforeLeave: (callback: (() => void) | undefined) => void;
  requestLeave: (onConfirm: () => void) => void;
}

const UnsavedChangesContext = createContext<
  UnsavedChangesContextValue | undefined
>(undefined);

interface UnsavedChangesProviderProps {
  children: ReactNode;
}

export function UnsavedChangesProvider({
  children,
}: UnsavedChangesProviderProps) {
  const [isDirty, setDirty] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pendingOnConfirm, setPendingOnConfirm] = useState<(() => void) | null>(
    null
  );
  const onBeforeLeaveRef = useRef<(() => void) | undefined>(undefined);

  const setOnBeforeLeave = useCallback((callback: (() => void) | undefined) => {
    onBeforeLeaveRef.current = callback;
  }, []);

  const requestLeave = useCallback(
    (onConfirm: () => void) => {
      if (!isDirty) {
        onConfirm();
        return;
      }
      setPendingOnConfirm(() => onConfirm);
      setLeaveDialogOpen(true);
    },
    [isDirty]
  );

  const handleCloseDialog = useCallback(() => {
    setLeaveDialogOpen(false);
    setPendingOnConfirm(null);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    onBeforeLeaveRef.current?.();
    pendingOnConfirm?.();
    handleCloseDialog();
  }, [pendingOnConfirm, handleCloseDialog]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const value: UnsavedChangesContextValue = {
    isDirty,
    setDirty,
    setOnBeforeLeave,
    requestLeave,
  };

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <Dialog
        open={leaveDialogOpen}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent
          className="sm:max-w-sm"
          aria-describedby="unsaved-changes-description"
        >
          <DialogHeader className="gap-4">
            <DialogTitle>Alterações não salvas</DialogTitle>
            <DialogDescription id="unsaved-changes-description">
              Você tem alterações não salvas no currículo. Deseja realmente
              sair? As alterações serão perdidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3 sm:justify-end">
            <Button size="brand" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button size="brand" variant="brand" onClick={handleConfirmLeave}>
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges(): UnsavedChangesContextValue {
  const context = useContext(UnsavedChangesContext);
  if (context === undefined) {
    throw new Error(
      "useUnsavedChanges must be used within an UnsavedChangesProvider"
    );
  }
  return context;
}
