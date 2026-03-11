"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

export type ResumeFormSectionId =
  | "personalData"
  | "summary"
  | "hardSkills"
  | "softSkills"
  | "languages"
  | "education"
  | "experience";

interface Props {
  sectionId: ResumeFormSectionId;
  title: string;
  icon: LucideIcon;
  isExpanded: boolean;
  onToggle: (sectionId: ResumeFormSectionId) => void;
  children: ReactNode;
}

export function ResumeFormCollapsibleSectionCard({
  sectionId,
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: Props) {
  const sectionContentId = `resume-form-section-content-${sectionId}`;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 p-7 text-left"
        aria-expanded={isExpanded}
        aria-controls={sectionContentId}
        onClick={() => onToggle(sectionId)}
      >
        <span className="flex items-center gap-5">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-section-title">{title}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      {isExpanded ? (
        <div id={sectionContentId} className="px-7 pb-7">
          {children}
        </div>
      ) : null}
    </section>
  );
}
