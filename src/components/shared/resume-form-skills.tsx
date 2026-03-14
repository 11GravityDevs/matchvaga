"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { RESUME_LIMITS } from "@/constants/resume";
import { capitalizeSkill } from "@/utils/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ResumeFormSkillsProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  isSaving?: boolean;
  skillsError?: string;
  duplicateErrorMessage?: string;
  placeholder?: string;
  addButtonText?: string;
  id?: string;
  skillsMax:
    | typeof RESUME_LIMITS.HARD_SKILLS_MAX
    | typeof RESUME_LIMITS.SOFT_SKILLS_MAX;
}

export function ResumeFormSkills({
  skills,
  onChange,
  isSaving,
  skillsError,
  skillsMax,
  duplicateErrorMessage,
  placeholder = "Digite uma habilidade e pressione Enter",
  addButtonText = "Adicionar habilidades",
  id = "resume-form-skills",
}: ResumeFormSkillsProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const skillInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingSkill && skillInputRef.current) {
      skillInputRef.current.focus();
    }
  }, [isAddingSkill]);

  const addSkill = () => {
    const trimmed = newSkill.trim();

    if (!trimmed || skills.length >= skillsMax) return;

    const capitalized = capitalizeSkill(trimmed);

    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === capitalized.toLowerCase()
    );

    if (isDuplicate) {
      setDuplicateError(
        duplicateErrorMessage ?? "Esta habilidade já foi adicionada."
      );
      return;
    }

    setDuplicateError(null);
    onChange([...skills, capitalized]);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div id={id} className="flex scroll-mt-6 scroll-mb-6 flex-col">
      <div className="flex flex-col gap-1.5">
        {skillsError && (
          <p className="text-sm text-destructive" role="alert">
            {skillsError}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-7">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="flex items-center gap-1.5 rounded-full border border-accent-brand-light bg-accent-brand-light/50 px-2.5 py-1.5"
              >
                <span className="text-small-medium text-accent-brand">
                  {skill}
                </span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="flex shrink-0 cursor-pointer items-center justify-center text-accent-brand hover:text-accent-brand-hover"
                  aria-label={`Remover ${skill}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {isAddingSkill && (
          <div className="flex flex-col gap-1">
            <Input
              ref={skillInputRef}
              value={newSkill}
              onChange={(e) => {
                setNewSkill(e.target.value);
                setDuplicateError(null);
              }}
              maxLength={RESUME_LIMITS.TEXT_FIELD_MAX}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
                if (e.key === "Escape") {
                  setIsAddingSkill(false);
                  setNewSkill("");
                  setDuplicateError(null);
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
              placeholder={placeholder}
              disabled={isSaving || skills.length >= skillsMax}
              className="h-9 bg-background px-3 shadow-none focus-visible:border-accent-brand focus-visible:ring-1 focus-visible:ring-accent-brand/30"
              aria-invalid={!!skillsError || !!duplicateError}
            />
            {duplicateError && (
              <p className="text-sm text-destructive" role="alert">
                {duplicateError}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          {!isAddingSkill ? (
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={() => {
                setDuplicateError(null);
                setIsAddingSkill(true);
              }}
              disabled={isSaving || skills.length >= skillsMax}
              className="w-fit gap-1.5 text-small"
            >
              <Plus className="h-4 w-4" />
              {addButtonText}
            </Button>
          ) : (
            <span />
          )}

          <span className="text-small text-muted-foreground">
            {skills.length} / {skillsMax}
          </span>
        </div>
      </div>
    </div>
  );
}
