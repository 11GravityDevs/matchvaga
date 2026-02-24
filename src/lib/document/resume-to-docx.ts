import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  convertInchesToTwip,
} from "docx";
import type { ResumeData } from "@/types/resume";
import {
  getSkillsByCategoryForDisplay,
  formatResumeDateBr,
} from "@/utils/resume";

function buildContactLine(data: ResumeData): string {
  const parts: string[] = [];
  if (data.location) parts.push(data.location);
  if (data.phone) parts.push(data.phone);
  if (data.linkedin) parts.push(data.linkedin);
  if (data.github) parts.push(data.github);
  if (data.email) parts.push(data.email);
  return parts.join(" | ");
}

export async function buildResumeDocx(data: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];
  const skillsForDisplay = getSkillsByCategoryForDisplay(data);

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.fullName,
          bold: true,
          size: 44,
        }),
      ],
      alignment: "center",
      spacing: { after: 80 },
    })
  );

  const contactLine = buildContactLine(data);
  if (contactLine) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactLine,
            size: 20,
            color: "555555",
          }),
        ],
        alignment: "center",
        spacing: { after: 200 },
      })
    );
  }

  if (data.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Resumo Profissional",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: data.summary, size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  if (skillsForDisplay.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Habilidades Técnicas",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      })
    );
    for (const cat of skillsForDisplay) {
      const line =
        cat.items.length > 0
          ? `${cat.category}: ${cat.items.join(", ")}`
          : cat.category;
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${line}`, size: 22 })],
          spacing: { after: 40 },
        })
      );
    }
    children.push(
      new Paragraph({
        spacing: { after: 200 },
      })
    );
  }

  if (data.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Experiência Profissional",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      })
    );

    for (const exp of data.experience) {
      const dateEnd =
        exp.isCurrent || !exp.endDate
          ? "Presente"
          : formatResumeDateBr(exp.endDate);

      const jobTitleRun = new TextRun({
        text: exp.jobTitle,
        bold: true,
        size: 22,
      });
      const jobMetaParts: string[] = [];
      if (exp.company) jobMetaParts.push(exp.company);
      if (exp.location) jobMetaParts.push(exp.location);
      jobMetaParts.push(`${formatResumeDateBr(exp.startDate)} – ${dateEnd}`);
      const jobMetaRun = new TextRun({
        text: jobMetaParts.length > 0 ? ` | ${jobMetaParts.join(" | ")}` : "",
        size: 20,
        color: "555555",
      });
      children.push(
        new Paragraph({
          children: [jobTitleRun, jobMetaRun],
          spacing: { before: 80, after: 40 },
        })
      );

      const bullets = exp.description
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const bullet of bullets) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${bullet}`,
                size: 22,
              }),
            ],
            spacing: { after: 40 },
          })
        );
      }
      children.push(
        new Paragraph({
          spacing: { after: 120 },
        })
      );
    }
  }

  if (data.education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Formação",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      })
    );

    for (const edu of data.education) {
      const dateEnd =
        edu.isCurrent || !edu.completionDate
          ? "Presente"
          : formatResumeDateBr(edu.completionDate);
      const eduMetaParts: string[] = [];
      if (edu.institution) eduMetaParts.push(edu.institution);
      if (edu.level) eduMetaParts.push(edu.level);
      eduMetaParts.push(`${formatResumeDateBr(edu.startDate)} – ${dateEnd}`);

      const courseRun = new TextRun({
        text: edu.course,
        bold: true,
        size: 22,
      });
      const eduMetaRun = new TextRun({
        text: eduMetaParts.length > 0 ? ` | ${eduMetaParts.join(" | ")}` : "",
        size: 20,
        color: "555555",
      });
      children.push(
        new Paragraph({
          children: [courseRun, eduMetaRun],
          spacing: { before: 80, after: 40 },
        })
      );

      if (edu.description) {
        const bullets = edu.description
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        for (const bullet of bullets) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${bullet}`,
                  size: 22,
                }),
              ],
              spacing: { after: 40 },
            })
          );
        }
      }
      children.push(
        new Paragraph({
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.5),
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
