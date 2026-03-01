import type { ResumeData } from "@/types/resume";
import {
  formatResumeDateBr,
  getSkillsByCategoryForDisplay,
} from "@/utils/resume";

function ensureHttps(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function formatLinkLabel(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ResumePreviewDocument({ data }: { data: ResumeData }) {
  const contactItems: Array<{ href?: string; label: string }> = [];

  if (data.location) contactItems.push({ label: data.location });

  if (data.phone) contactItems.push({ label: data.phone });

  if (data.linkedin)
    contactItems.push({
      href: ensureHttps(data.linkedin),
      label: formatLinkLabel(data.linkedin),
    });

  if (data.github)
    contactItems.push({
      href: ensureHttps(data.github),
      label: formatLinkLabel(data.github),
    });

  if (data.email)
    contactItems.push({ href: `mailto:${data.email}`, label: data.email });

  const separator = <div className="h-px w-full border-b border-border" />;

  return (
    <div className="flex flex-col gap-6">
      {/* Header — centered */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-card-title text-foreground">
          {data.fullName || "—"}
        </h2>
        {contactItems.length > 0 && (
          <p className="flex flex-wrap items-center justify-center gap-x-1 text-small text-foreground">
            {contactItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && (
                  <span className="text-muted-foreground" aria-hidden>
                    {" | "}
                  </span>
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  item.label
                )}
              </span>
            ))}
          </p>
        )}
      </div>
      {separator}

      {/* Resumo Profissional */}
      <div className="flex flex-col gap-2">
        <h3 className="text-section-title text-foreground">
          Resumo Profissional
        </h3>
        <p className="text-small-leading leading-relaxed text-foreground">
          {data.summary || "—"}
        </p>
      </div>
      {(getSkillsByCategoryForDisplay(data).length > 0 ||
        data.experience.length > 0 ||
        data.education.length > 0) &&
        separator}

      {/* Habilidades Técnicas */}
      {getSkillsByCategoryForDisplay(data).length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <h3 className="text-section-title text-foreground">
              Habilidades Técnicas
            </h3>
            <ul className="list-outside list-disc space-y-2 pl-5 text-small-leading text-foreground">
              {getSkillsByCategoryForDisplay(data).map((cat, i) => (
                <li key={i} className="pl-1">
                  <span className="font-semibold">{cat.category}:</span>{" "}
                  {cat.items.join(", ")}
                </li>
              ))}
            </ul>
          </div>
          {(data.experience.length > 0 || data.education.length > 0) &&
            separator}
        </>
      )}

      {/* Experiência Profissional */}
      {data.experience.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <h3 className="text-section-title text-foreground">
              Experiência Profissional
            </h3>
            <div className="flex flex-col gap-4">
              {data.experience.map((exp, i) => {
                const jobLineParts = [
                  exp.jobTitle && <strong key="title">{exp.jobTitle}</strong>,
                  exp.company && <span key="company">{exp.company}</span>,
                  exp.location && <span key="location">{exp.location}</span>,
                  (exp.startDate || exp.endDate || exp.isCurrent) && (
                    <span key="dates">
                      {formatResumeDateBr(exp.startDate)} –{" "}
                      {exp.isCurrent || !exp.endDate
                        ? "Presente"
                        : formatResumeDateBr(exp.endDate)}
                    </span>
                  ),
                ].filter(Boolean);
                const responsibilities = exp.description
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);

                return (
                  <div key={i} className="flex flex-col gap-2">
                    <p className="text-small-leading text-foreground">
                      {jobLineParts.reduce<React.ReactNode[]>(
                        (acc, part, idx) =>
                          idx === 0 ? [part] : [...acc, " | ", part],
                        []
                      )}
                    </p>
                    {responsibilities.length > 0 && (
                      <ul className="list-outside list-disc space-y-1 pl-5 text-small-leading text-foreground">
                        {responsibilities.map((line, j) => (
                          <li key={j} className="pl-1">
                            {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {data.education.length > 0 && separator}
        </>
      )}

      {/* Formação */}
      {data.education.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-section-title text-foreground">Formação</h3>
          <div className="flex flex-col gap-3">
            {data.education.map((edu, i) => {
              const eduLineParts = [
                edu.course && <strong key="course">{edu.course}</strong>,
                edu.institution && (
                  <span key="institution">{edu.institution}</span>
                ),
                edu.level && <span key="level">{edu.level}</span>,
                (edu.startDate || edu.completionDate) && (
                  <span key="dates">
                    {formatResumeDateBr(edu.startDate)} –{" "}
                    {edu.isCurrent || !edu.completionDate
                      ? "Presente"
                      : formatResumeDateBr(edu.completionDate)}
                  </span>
                ),
              ].filter(Boolean);
              const achievements = edu.description
                ? edu.description
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];

              return (
                <div key={i} className="flex flex-col gap-2">
                  <p className="text-small-leading text-foreground">
                    {eduLineParts.reduce<React.ReactNode[]>(
                      (acc, part, idx) =>
                        idx === 0 ? [part] : [...acc, " | ", part],
                      []
                    )}
                  </p>
                  {achievements.length > 0 && (
                    <ul className="list-outside list-disc space-y-1 pl-5 text-small-leading text-foreground">
                      {achievements.map((line, j) => (
                        <li key={j} className="pl-1">
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
