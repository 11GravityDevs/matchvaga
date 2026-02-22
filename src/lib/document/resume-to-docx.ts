import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  convertInchesToTwip,
} from "docx";
import type { ResumeData } from "@/types/resume";

export async function buildResumeDocx(data: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.fullName,
          bold: true,
          size: 44,
        }),
      ],
      spacing: { after: 80 },
    })
  );

  const contactParts: string[] = [data.email, data.phone, data.location];
  if (data.linkedin) contactParts.push(data.linkedin);
  if (data.github) contactParts.push(data.github);
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactParts.join(" | "),
          size: 20,
          color: "555555",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  if (data.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Resumo",
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

  if (data.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Habilidades",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.join(", "),
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  if (data.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Experiência",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      })
    );

    for (const exp of data.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.jobTitle,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 80, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? ` • ${exp.location}` : ""} | ${exp.startDate} – ${exp.endDate}`,
              size: 20,
              color: "555555",
            }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: exp.description, size: 22 })],
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
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.course,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 80, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.institution} • ${edu.level} | ${edu.startDate} – ${edu.completionDate}`,
              size: 20,
              color: "555555",
            }),
          ],
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
