"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const STORAGE_KEY_CREDIT_DIALOG_DONT_SHOW =
  "matchvaga-credit-consumption-dialog-dont-show";

export function shouldSkipCreditConsumptionDialog(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_CREDIT_DIALOG_DONT_SHOW) === "true";
}

export function setCreditConsumptionDialogDontShow(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(STORAGE_KEY_CREDIT_DIALOG_DONT_SHOW, "true");
  } else {
    localStorage.removeItem(STORAGE_KEY_CREDIT_DIALOG_DONT_SHOW);
  }
}

interface GenerateResumeDialogsProps {
  isConfirmNoSkillsDialogOpen: boolean;
  onConfirmNoSkillsDialogOpenChange: (open: boolean) => void;
  isConfirmCreditDialogOpen: boolean;
  onConfirmCreditDialogOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  analysisId: string | null;
  onConfirmNoSkills: () => void;
  onConfirmCredit: () => void;
}

export function GenerateResumeDialogs({
  isConfirmNoSkillsDialogOpen,
  onConfirmNoSkillsDialogOpenChange,
  isConfirmCreditDialogOpen,
  onConfirmCreditDialogOpenChange,
  isGenerating,
  analysisId,
  onConfirmNoSkills,
  onConfirmCredit,
}: GenerateResumeDialogsProps) {
  const [dontShowCreditDialogAgain, setDontShowCreditDialogAgain] =
    useState(false);

  const handleConfirmCredit = () => {
    if (dontShowCreditDialogAgain) {
      setCreditConsumptionDialogDontShow(true);
    }
    onConfirmCreditDialogOpenChange(false);
    onConfirmCredit();
  };

  return (
    <>
      <Dialog
        open={isConfirmNoSkillsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            onConfirmNoSkillsDialogOpenChange(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nenhuma habilidade selecionada</DialogTitle>
          </DialogHeader>
          <p className="text-small-leading text-muted-foreground">
            Você não selecionou nenhuma habilidade para incorporar ao currículo.
            Deseja mesmo prosseguir?
          </p>
          <DialogFooter className="flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              size="brand"
              variant="outline"
              className="gap-1.5"
              onClick={() => onConfirmNoSkillsDialogOpenChange(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="brand"
              variant="destructiveSolid"
              onClick={() => {
                onConfirmNoSkillsDialogOpenChange(false);
                onConfirmNoSkills();
              }}
              disabled={!analysisId || isGenerating}
            >
              Prosseguir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isConfirmCreditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            onConfirmCreditDialogOpenChange(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Consumir análise</DialogTitle>
          </DialogHeader>
          <p className="text-small-leading text-muted-foreground">
            Será utilizada 1 análise.
          </p>
          <label className="flex cursor-pointer items-center gap-1 self-start">
            <Checkbox
              className="cursor-pointer border-2 border-accent-brand data-[state=checked]:border-accent-brand data-[state=checked]:bg-accent-brand"
              checked={dontShowCreditDialogAgain}
              onCheckedChange={(checked) =>
                setDontShowCreditDialogAgain(checked === true)
              }
              disabled={isGenerating}
            />
            <span className="text-small font-medium">Não exibir novamente</span>
          </label>
          <DialogFooter className="flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              size="brand"
              variant="outline"
              className="gap-1.5"
              onClick={() => onConfirmCreditDialogOpenChange(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="brand"
              variant="brand"
              className="gap-1.5"
              onClick={handleConfirmCredit}
              disabled={!analysisId || isGenerating}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
