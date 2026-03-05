import type {
  EducationEntry,
  ExperienceEntry,
  ResumeData,
  ResumeValidationErrors,
} from "@/types/resume";

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
  const skills = Array.isArray(formData.skills) ? formData.skills : [];
  if (skills.length === 0) {
    errors.skills = "Adicione pelo menos uma habilidade";
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
    } else {
      const experiencesWithoutEndDate = experience.filter(
        (exp: ExperienceEntry) => !exp.endDate?.trim()
      );
      const currentExperiences = experience.filter(
        (exp: ExperienceEntry) => exp.isCurrent === true
      );
      if (experiencesWithoutEndDate.length > 1) {
        errors.experience =
          "Apenas uma experiência pode estar em andamento (sem data de término). Preencha a data de término das demais.";
      } else if (
        experiencesWithoutEndDate.some(
          (exp: ExperienceEntry) => exp.isCurrent !== true
        )
      ) {
        errors.experience =
          "Preencha a data de término ou marque como experiência atual.";
      } else if (currentExperiences.length > 1) {
        errors.experience =
          "Apenas uma experiência pode ser marcada como atual.";
      }
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

        return entryErrors;
      });
    const hasAnyEducationEntryErrors = educationEntryErrors.some(
      (e) => Object.keys(e).length > 0
    );
    if (hasAnyEducationEntryErrors) {
      errors.educationEntryErrors = educationEntryErrors;
    }

    const educationsWithoutCompletionDate = education.filter(
      (edu: EducationEntry) => !edu.completionDate?.trim()
    );
    const currentEducations = education.filter(
      (edu: EducationEntry) => edu.isCurrent === true
    );

    if (educationsWithoutCompletionDate.length > 1) {
      errors.education =
        "Apenas uma formação pode estar em andamento (sem data de conclusão). Preencha a data de conclusão das demais.";
    } else if (
      educationsWithoutCompletionDate.some(
        (edu: EducationEntry) => edu.isCurrent !== true
      )
    ) {
      errors.education =
        "Preencha a data de conclusão ou marque como formação atual.";
    } else if (currentEducations.length > 1) {
      errors.education = "Apenas uma formação pode ser marcada como atual.";
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
