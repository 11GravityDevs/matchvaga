"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INPUT_CLASS } from "@/components/shared/resume-form-card";

interface ResumeFormLanguagesProps {
  languages: string[];
  onChange: (languages: string[]) => void;
  isSaving?: boolean;
  languagesError?: string;
}

export function ResumeFormLanguages({
  languages,
  onChange,
  isSaving,
  languagesError,
}: ResumeFormLanguagesProps) {
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");
  const languageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingLanguage && languageInputRef.current) {
      languageInputRef.current.focus();
    }
  }, [isAddingLanguage]);

  const addLanguage = () => {
    const trimmed = newLanguage.trim();
    if (trimmed && !languages.includes(trimmed)) {
      onChange([...languages, trimmed]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    onChange(languages.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-section-title">Idiomas</h3>
        {languagesError && (
          <p className="text-sm text-destructive" role="alert">
            {languagesError}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {languages.map((language, index) => (
              <span
                key={`${language}-${index}`}
                className="flex items-center gap-1.5 rounded-full border border-accent-brand-light bg-accent-brand-light/50 px-2.5 py-1.5"
              >
                <span className="text-small-medium text-accent-brand">
                  {language}
                </span>
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="flex shrink-0 cursor-pointer items-center justify-center text-accent-brand hover:text-accent-brand-hover"
                  aria-label={`Remover ${language}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {isAddingLanguage && (
          <Input
            ref={languageInputRef}
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLanguage();
              }
              if (e.key === "Escape") {
                setIsAddingLanguage(false);
                setNewLanguage("");
              }
            }}
            onBlur={(e) => {
              const relatedTarget = e.relatedTarget as HTMLElement | null;
              if (relatedTarget?.closest?.('button[aria-label^="Remover"]')) {
                return;
              }
              if (!newLanguage.trim()) {
                setIsAddingLanguage(false);
              }
            }}
            placeholder="Digite um idioma e pressione Enter"
            disabled={isSaving}
            className={INPUT_CLASS}
          />
        )}
        {!isAddingLanguage && (
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={() => setIsAddingLanguage(true)}
            className="w-fit gap-1.5 text-small"
          >
            <Plus className="h-4 w-4" />
            Adicionar idiomas
          </Button>
        )}
      </div>
    </div>
  );
}
