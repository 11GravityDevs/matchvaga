"use server";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

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
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summary: {
    lineHeight: 1.5,
    color: "#333",
  },
  skills: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skill: {
    backgroundColor: "#eee",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 9,
    marginRight: 6,
    marginBottom: 4,
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
  company: {
    fontSize: 10,
    color: "#555",
  },
  dates: {
    fontSize: 9,
    color: "#666",
  },
  description: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#333",
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

interface ResumeDocumentProps {
  data: ResumeData;
}

export function ResumeDocument({ data }: ResumeDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName}</Text>
          <View style={styles.contact}>
            <Text>{data.email}</Text>
            <Text> • </Text>
            <Text>{data.phone}</Text>
            <Text> • </Text>
            <Text>{data.location}</Text>
            {data.linkedin ? (
              <>
                <Text> • </Text>
                <Text>{data.linkedin}</Text>
              </>
            ) : null}
            {data.github ? (
              <>
                <Text> • </Text>
                <Text>{data.github}</Text>
              </>
            ) : null}
          </View>
        </View>

        {data.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        ) : null}

        {data.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.skills}>
              {data.skills.map((skill, i) => (
                <Text key={i} style={styles.skill}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiência</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.experienceItem}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                    <Text style={styles.company}>
                      {exp.company}
                      {exp.location ? ` • ${exp.location}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.dates}>
                    {exp.startDate} – {exp.endDate}
                  </Text>
                </View>
                <Text style={styles.description}>{exp.description}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formação</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.educationItem}>
                <View style={styles.eduHeader}>
                  <View>
                    <Text style={styles.course}>{edu.course}</Text>
                    <Text style={styles.institution}>
                      {edu.institution} • {edu.level}
                    </Text>
                  </View>
                  <Text style={styles.dates}>
                    {edu.startDate} – {edu.completionDate}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
