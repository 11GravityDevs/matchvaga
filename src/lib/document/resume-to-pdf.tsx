import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";
import {
  getSkillsByCategoryForDisplay,
  formatResumeDateBr,
} from "@/utils/resume";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: "#555",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  summary: {
    lineHeight: 1.5,
    color: "#333",
  },
  skillCategory: {
    marginBottom: 4,
  },
  skillCategoryLabel: {
    fontWeight: "bold",
    fontSize: 10,
  },
  skillCategoryItems: {
    fontSize: 10,
    color: "#333",
    marginLeft: 8,
  },
  experienceItem: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  jobTitle: {
    fontWeight: "bold",
    fontSize: 11,
  },
  jobMeta: {
    fontSize: 10,
    color: "#555",
  },
  dates: {
    fontSize: 9,
    color: "#666",
  },
  bulletList: {
    marginLeft: 12,
    marginTop: 4,
  },
  bulletItem: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#333",
    marginBottom: 2,
  },
  educationItem: {
    marginBottom: 8,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  course: {
    fontWeight: "bold",
    fontSize: 11,
  },
  institution: {
    fontSize: 10,
    color: "#555",
  },
});

function buildContactLine(data: ResumeData): string {
  const parts: string[] = [];
  if (data.location) parts.push(data.location);
  if (data.phone) parts.push(data.phone);
  if (data.linkedin) parts.push(data.linkedin);
  if (data.github) parts.push(data.github);
  if (data.email) parts.push(data.email);
  return parts.join(" | ");
}

interface ResumeDocumentProps {
  data: ResumeData;
}

export function ResumeDocument({ data }: ResumeDocumentProps) {
  const skillsForDisplay = getSkillsByCategoryForDisplay(data);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName}</Text>
          <Text style={styles.contact}>{buildContactLine(data)}</Text>
        </View>

        {data.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo Profissional</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        ) : null}

        {skillsForDisplay.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades Técnicas</Text>
            {skillsForDisplay.map((cat, i) => (
              <View key={i} style={styles.skillCategory}>
                <Text style={styles.skillCategoryLabel}>
                  • {cat.category}: {cat.items.join(", ")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.languages?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <Text style={styles.summary}>{data.languages.join(", ")}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiência Profissional</Text>
            {data.experience.map((exp, i) => {
              const dateEnd =
                exp.isCurrent || !exp.endDate
                  ? "Presente"
                  : formatResumeDateBr(exp.endDate);
              const jobLineParts: string[] = [];
              if (exp.jobTitle) jobLineParts.push(exp.jobTitle);
              if (exp.company) jobLineParts.push(exp.company);
              if (exp.location) jobLineParts.push(exp.location);
              jobLineParts.push(
                `${formatResumeDateBr(exp.startDate)} – ${dateEnd}`
              );
              const bullets = exp.description
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);

              return (
                <View key={i} style={styles.experienceItem}>
                  <View style={styles.jobHeader}>
                    <View>
                      <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                      <Text style={styles.jobMeta}>
                        {jobLineParts.join(" | ")}
                      </Text>
                    </View>
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
        ) : null}

        {data.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formação</Text>
            {data.education.map((edu, i) => {
              const dateEnd =
                edu.isCurrent || !edu.completionDate
                  ? "Presente"
                  : formatResumeDateBr(edu.completionDate);
              const eduLineParts: string[] = [];
              if (edu.course) eduLineParts.push(edu.course);
              if (edu.institution) eduLineParts.push(edu.institution);
              if (edu.level) eduLineParts.push(edu.level);
              eduLineParts.push(
                `${formatResumeDateBr(edu.startDate)} – ${dateEnd}`
              );
              const bullets = edu.description
                ? edu.description
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];

              return (
                <View key={i} style={styles.educationItem}>
                  <View style={styles.eduHeader}>
                    <View>
                      <Text style={styles.course}>{edu.course}</Text>
                      <Text style={styles.institution}>
                        {eduLineParts.join(" | ")}
                      </Text>
                    </View>
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
        ) : null}
      </Page>
    </Document>
  );
}
