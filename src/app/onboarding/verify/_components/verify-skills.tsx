"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SECTION_TITLE_CLASS } from "./verify-content";

interface VerifySkillsProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  isSaving?: boolean;
}

export function VerifySkills({
  skills,
  onChange,
  isSaving,
}: VerifySkillsProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const skillInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingSkill && skillInputRef.current) {
      skillInputRef.current.focus();
    }
  }, [isAddingSkill]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className={SECTION_TITLE_CLASS}>Habilidades</h3>
      <div className="flex flex-col gap-3">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1.5"
              >
                <span className="text-[13px] font-medium text-[#2563EB]">
                  {skill}
                </span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="flex shrink-0 cursor-pointer items-center justify-center text-[#2563EB] hover:text-[#1D4ED8]"
                  aria-label={`Remover ${skill}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {isAddingSkill && (
          <Input
            ref={skillInputRef}
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
              if (e.key === "Escape") {
                setIsAddingSkill(false);
                setNewSkill("");
              }
            }}
            onBlur={(e) => {
              const relatedTarget = e.relatedTarget as HTMLElement | null;
              if (relatedTarget?.closest?.('button[aria-label^="Remover"]')) {
                return;
              }
              if (!newSkill.trim()) {
                setIsAddingSkill(false);
              }
            }}
            placeholder="Digite uma habilidade e pressione Enter"
            disabled={isSaving}
            className="h-9 bg-background px-3 shadow-none focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30"
          />
        )}
        {!isAddingSkill && (
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddingSkill(true)}
            className="w-fit gap-1.5 bg-accent-brand text-[13px] text-white hover:bg-accent-brand/90"
          >
            <Plus className="h-4 w-4" />
            Adicionar habilidades
          </Button>
        )}
      </div>
    </div>
  );
}
