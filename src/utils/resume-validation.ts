import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
  ResumeValidationErrors,
} from "@/types/resume";

function toComparableDate(value: string): number {
  if (!value?.trim()) return NaN;

  const v = value.trim();

  const yearOnly = /^\d{4}$/.exec(v);

  if (yearOnly) return Date.UTC(Number(yearOnly[0]), 0, 1);

  const yearMonth = /^(\d{4})-(\d{2})$/.exec(v);

  if (yearMonth)
    return Date.UTC(Number(yearMonth[1]), Number(yearMonth[2]) - 1, 1);

  return new Date(v).getTime();
}

export function getResumeValidationErrors(
  formData: ResumeData
): ResumeValidationErrors | null {
  const errors: ResumeValidationErrors = {};

  if (formData.fullName?.trim() === "") {
    errors.fullName = "Nome completo é obrigatório";
  }

  if (formData.email?.trim() === "") {
    errors.email = "E-mail é obrigatório";
  }

  if (formData.location?.trim() === "") {
    errors.location = "Local é obrigatório";
  }

  if (formData.phone?.trim() === "") {
    errors.phone = "Telefone é obrigatório";
  }

  if (formData.summary?.trim() === "") {
    errors.summary = "Resumo profissional é obrigatório";
  }

  const hardSkills = Array.isArray(formData.hardSkills)
    ? formData.hardSkills
    : [];

  if (hardSkills.length === 0) {
    errors.hardSkills = "Adicione pelo menos uma habilidade técnica";
  }

  const experience = Array.isArray(formData.experience)
    ? formData.experience
    : [];

  if (experience.length > 0) {
    const experienceEntryErrors: ResumeValidationErrors["experienceEntryErrors"] =
      experience.map((exp: ExperienceEntry) => {
        const entryErrors: Partial<Record<keyof ExperienceEntry, string>> = {};

        if (exp.company?.trim() === "") {
          entryErrors.company = "Empresa é obrigatória";
        }

        if (exp.jobTitle?.trim() === "") {
          entryErrors.jobTitle = "Cargo é obrigatório";
        }

        if (exp.startDate?.trim() === "") {
          entryErrors.startDate = "Data de início é obrigatória";
        }

        if (!exp.isCurrent && exp.endDate?.trim() === "") {
          entryErrors.endDate =
            "Preencha a data de término ou marque como experiência atual.";
        }

        if (
          !exp.isCurrent &&
          exp.startDate?.trim() !== "" &&
          exp.endDate?.trim() !== ""
        ) {
          const start = toComparableDate(exp.startDate);

          const end = toComparableDate(exp.endDate);

          if (!Number.isNaN(start) && !Number.isNaN(end) && start > end) {
            entryErrors.endDate =
              "A data de término não pode ser anterior à data de início.";
          }
        }

        if (exp.location?.trim() === "") {
          entryErrors.location = "Local é obrigatório";
        }

        if (exp.description?.trim() === "") {
          entryErrors.description = "Descrição é obrigatória";
        }

        return entryErrors;
      });
    const hasAnyExperienceEntryErrors = experienceEntryErrors.some(
      (e) => Object.keys(e).length > 0
    );

    if (hasAnyExperienceEntryErrors) {
      errors.experienceEntryErrors = experienceEntryErrors;
    }

    const hasValidExperience = experience.some(
      (exp: ExperienceEntry) =>
        exp.company?.trim() !== "" && exp.jobTitle?.trim() !== ""
    );

    if (!hasValidExperience) {
      errors.experience =
        "Preencha pelo menos uma experiência com empresa e cargo";
    }
  }

  const education = Array.isArray(formData.education) ? formData.education : [];

  if (education.length > 0) {
    const educationEntryErrors: ResumeValidationErrors["educationEntryErrors"] =
      education.map((edu: EducationEntry) => {
        const entryErrors: Partial<Record<keyof EducationEntry, string>> = {};

        if (edu.course?.trim() === "") {
          entryErrors.course = "Curso é obrigatório";
        }

        if (edu.level?.trim() === "") {
          entryErrors.level = "Nível é obrigatório";
        }

        if (edu.institution?.trim() === "") {
          entryErrors.institution = "Instituição é obrigatória";
        }

        if (edu.startDate?.trim() === "") {
          entryErrors.startDate = "Data de início é obrigatória";
        }

        if (!edu.isCurrent && edu.completionDate?.trim() === "") {
          entryErrors.completionDate =
            "Preencha a data de conclusão ou marque como formação atual.";
        }

        if (
          !edu.isCurrent &&
          edu.startDate?.trim() !== "" &&
          edu.completionDate?.trim() !== ""
        ) {
          const start = toComparableDate(edu.startDate);
          const end = toComparableDate(edu.completionDate);
          if (!Number.isNaN(start) && !Number.isNaN(end) && start > end) {
            entryErrors.completionDate =
              "A data de conclusão não pode ser anterior à data de início.";
          }
        }

        return entryErrors;
      });

    const hasAnyEducationEntryErrors = educationEntryErrors.some(
      (e) => Object.keys(e).length > 0
    );

    if (hasAnyEducationEntryErrors) {
      errors.educationEntryErrors = educationEntryErrors;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
