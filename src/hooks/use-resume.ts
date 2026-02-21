"use client";

import { useCallback, useState } from "react";
import type { ResumeData } from "@/types/resume";

export interface UseResumeReturn {
  resumeData: ResumeData;
  isLoading: boolean;
  error: Error | null;
  save: (data: ResumeData) => Promise<void>;
  isSaving: boolean;
}

const MOCK_RESUME_DATA: ResumeData = {
  fullName: "João Silva",
  email: "joao.silva@email.com",
  location: "São Paulo, SP",
  phone: "(11) 98765-4321",
  linkedin: "https://linkedin.com/in/joaosilva",
  github: "https://github.com/joaosilva",
  summary:
    "Desenvolvedor Full Stack com 5 anos de experiência em React, Node.js e TypeScript. Focado em criar aplicações escaláveis e de alta performance.",
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
  experience: [
    {
      jobTitle: "Desenvolvedor Senior",
      company: "Tech Corp",
      startDate: "2022-01",
      endDate: "2024-12",
      location: "São Paulo, SP",
      description:
        "Liderança técnica de equipe de 5 desenvolvedores. Arquitetura de microsserviços.",
    },
  ],
  education: [
    {
      institution: "Universidade de São Paulo",
      course: "Ciência da Computação",
      level: "Bacharelado",
      startDate: "2015-01",
      completionDate: "2019-12",
    },
  ],
};

export function useResume(): UseResumeReturn {
  const [resumeData, setResumeData] = useState<ResumeData>(MOCK_RESUME_DATA);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(async (data: ResumeData) => {
    setIsSaving(true);
    try {
      // TODO: Call API to save resume
      setResumeData(data);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    resumeData,
    isLoading,
    error,
    save,
    isSaving,
  };
}
