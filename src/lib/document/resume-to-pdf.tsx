import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";
import {
  getSkillsByCategoryForDisplay,
  formatResumeDateBr,
  getContactLineForDisplay,
} from "@/utils/resume";

const colors = {
  foreground: "#0a0a0a",
  muted: "#737373",
  border: "#e5e5e5",
} as const;

const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

const styles = StyleSheet.create({
  page: {
    paddingTop: space.xxl,
    paddingBottom: space.xxl,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
    color: colors.foreground,
  },
  header: {
    alignItems: "center",
    marginBottom: space.lg,
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: space.md,
    color: colors.foreground,
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  contact: {
    fontSize: 10,
    color: colors.foreground,
    textAlign: "center",
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: space.md,
    marginBottom: space.md,
  },
  section: {
    marginBottom: 0,
  },
  sectionLast: {
    marginBottom: space.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: space.sm,
    color: colors.foreground,
    letterSpacing: 0.3,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.65,
    color: colors.foreground,
  },
  skillList: {
    marginLeft: 18,
  },
  skillItem: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: space.sm,
    fontSize: 10,
  },
  skillItemLast: {
    marginBottom: 0,
  },
  skillBullet: {
    color: colors.foreground,
  },
  skillCategoryLabel: {
    fontWeight: "bold",
    color: colors.foreground,
  },
  skillCategoryItems: {
    color: colors.foreground,
  },
  experienceItem: {
    marginBottom: space.md,
  },
  experienceItemLast: {
    marginBottom: 0,
  },
  jobLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: space.xs,
    fontSize: 10,
  },
  jobTitle: {
    fontWeight: "bold",
    color: colors.foreground,
  },
  jobMeta: {
    color: colors.foreground,
  },
  bulletList: {
    marginLeft: 18,
    marginTop: space.sm,
  },
  bulletItem: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.foreground,
    marginBottom: space.xs,
  },
  educationItem: {
    marginBottom: space.md,
  },
  educationItemLast: {
    marginBottom: 0,
  },
  eduLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: space.xs,
    fontSize: 10,
  },
  course: {
    fontWeight: "bold",
    color: colors.foreground,
  },
  eduMeta: {
    color: colors.foreground,
  },
});

function Separator() {
  return <View style={styles.separator} />;
}

interface ResumeDocumentProps {
  data: ResumeData;
}

export function ResumeDocument({ data }: ResumeDocumentProps) {
  const skillsForDisplay = getSkillsByCategoryForDisplay(data);
  const contactLine = getContactLineForDisplay(data);
  const hasSkills = skillsForDisplay.length > 0;
  const hasExperience = data.experience.length > 0;
  const hasEducation = data.education.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {(data.fullName || "—").toUpperCase()}
          </Text>
          {contactLine ? (
            <Text style={styles.contact}>{contactLine}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Profissional</Text>
          <Text style={styles.summary}>{data.summary || "—"}</Text>
        </View>

        {(hasSkills || hasExperience || hasEducation) && <Separator />}

        {hasSkills && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades Técnicas</Text>
              <View style={styles.skillList}>
                {skillsForDisplay.map((cat, i) => (
                  <View
                    key={i}
                    style={[
                      styles.skillItem,
                      ...(i === skillsForDisplay.length - 1
                        ? [styles.skillItemLast]
                        : []),
                    ]}
                  >
                    <Text style={styles.skillBullet}>• </Text>
                    <Text style={styles.skillCategoryLabel}>
                      {cat.category}:{" "}
                    </Text>
                    <Text style={styles.skillCategoryItems}>
                      {cat.items.join(", ")}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            {(hasExperience || hasEducation) && <Separator />}
          </>
        )}

        {hasExperience && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experiência Profissional</Text>
              {data.experience.map((exp, i) => {
                const dateEnd =
                  exp.isCurrent || !exp.endDate
                    ? "Presente"
                    : formatResumeDateBr(exp.endDate);
                const metaParts: string[] = [];
                if (exp.company) metaParts.push(exp.company);
                if (exp.location) metaParts.push(exp.location);
                metaParts.push(
                  `${formatResumeDateBr(exp.startDate)} – ${dateEnd}`
                );
                const metaLine =
                  metaParts.length > 0 ? ` | ${metaParts.join(" | ")}` : "";
                const bullets = exp.description
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);

                return (
                  <View
                    key={i}
                    style={[
                      styles.experienceItem,
                      ...(hasEducation && i === data.experience.length - 1
                        ? [styles.experienceItemLast]
                        : []),
                    ]}
                  >
                    <View style={styles.jobLine}>
                      <Text style={styles.jobTitle}>
                        {(exp.jobTitle || "—") + " "}
                      </Text>
                      <Text style={styles.jobMeta}>{metaLine}</Text>
                    </View>
                    {bullets.length > 0 && (
                      <View style={styles.bulletList}>
                        {bullets.map((bullet, j) => (
                          <Text key={j} style={styles.bulletItem}>
                            • {bullet}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            {hasEducation && <Separator />}
          </>
        )}

        {hasEducation && (
          <View style={[styles.section, styles.sectionLast]}>
            <Text style={styles.sectionTitle}>Formação</Text>
            {data.education.map((edu, i) => {
              const dateEnd =
                edu.isCurrent || !edu.completionDate
                  ? "Presente"
                  : formatResumeDateBr(edu.completionDate);
              const metaParts: string[] = [];
              if (edu.institution) metaParts.push(edu.institution);
              if (edu.level) metaParts.push(edu.level);
              metaParts.push(
                `${formatResumeDateBr(edu.startDate)} – ${dateEnd}`
              );
              const metaLine =
                metaParts.length > 0 ? ` | ${metaParts.join(" | ")}` : "";
              const bullets = edu.description
                ? edu.description
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];

              return (
                <View
                  key={i}
                  style={[
                    styles.educationItem,
                    ...(i === data.education.length - 1
                      ? [styles.educationItemLast]
                      : []),
                  ]}
                >
                  <View style={styles.eduLine}>
                    <Text style={styles.course}>
                      {(edu.course || "—") + " "}
                    </Text>
                    <Text style={styles.eduMeta}>{metaLine}</Text>
                  </View>
                  {bullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {bullets.map((bullet, j) => (
                        <Text key={j} style={styles.bulletItem}>
                          • {bullet}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </Page>
    </Document>
  );
}
