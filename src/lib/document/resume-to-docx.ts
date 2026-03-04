import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import type { ResumeData } from "@/types/resume";
import {
  getSkillsByCategoryForDisplay,
  formatResumeDateBr,
  getContactLineForDisplay,
  sortExperienceByDateDesc,
  sortEducationByDateDesc,
} from "@/utils/resume";

const TWIP = 20;
const pt = (n: number) => n * TWIP;

const colors = {
  foreground: "0A0A0A",
  border: "E5E5E5",
} as const;

const FONT = {
  name: 40,
  section: 24,
  body: 22,
  meta: 22,
} as const;

const FONT_FAMILY = "Helvetica";

const SPACE = {
  afterTitle: pt(16),
  afterContact: pt(24),
  afterHeaderBorder: pt(24),
  beforeSection: pt(16),
  afterSectionTitle: pt(8),
  afterBlock: pt(16),
  afterJobLine: pt(4),
  beforeBulletList: pt(8),
  bulletGap: pt(4),
  afterExperienceItem: pt(16),
  afterSkillItem: pt(8),
} as const;

const INDENT_LEFT_PT = 18;
const indentLeftTwip = INDENT_LEFT_PT * TWIP;

const MARGIN_IN = 0.75;

function headerBorderParagraph() {
  return new Paragraph({
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        color: colors.border,
        size: 8,
        space: 1,
      },
    },
    spacing: { after: SPACE.afterHeaderBorder },
  });
}

function sectionSeparatorParagraph() {
  return new Paragraph({
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        color: colors.border,
        size: 8,
        space: 1,
      },
    },
    spacing: { before: SPACE.beforeSection, after: SPACE.beforeSection },
  });
}

export async function buildResumeDocx(data: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];
  const skillsForDisplay = getSkillsByCategoryForDisplay(data);
  const contactLine = getContactLineForDisplay(data);

  const runOpts = { font: FONT_FAMILY } as const;

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: (data.fullName || "—").toUpperCase(),
          bold: true,
          size: FONT.name,
          ...runOpts,
        }),
      ],
      alignment: "center",
      spacing: { after: SPACE.afterTitle },
    })
  );

  if (contactLine) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactLine,
            size: FONT.meta,
            color: colors.foreground,
            ...runOpts,
          }),
        ],
        alignment: "center",
        spacing: { after: SPACE.afterContact },
      })
    );
  }

  children.push(headerBorderParagraph());

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Resumo Profissional",
          bold: true,
          size: FONT.section,
          color: colors.foreground,
          ...runOpts,
        }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: SPACE.afterSectionTitle },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: data.summary || "—",
          size: FONT.body,
          color: colors.foreground,
          ...runOpts,
        }),
      ],
      spacing: { after: SPACE.afterBlock },
    })
  );

  if (skillsForDisplay.length > 0) {
    children.push(sectionSeparatorParagraph());
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Habilidades Técnicas",
            bold: true,
            size: FONT.section,
            color: colors.foreground,
            ...runOpts,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { after: SPACE.afterSectionTitle },
      })
    );
    for (const cat of skillsForDisplay) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "• ",
              size: FONT.body,
              color: colors.foreground,
              ...runOpts,
            }),
            new TextRun({
              text: `${cat.category}: `,
              bold: true,
              size: FONT.body,
              color: colors.foreground,
              ...runOpts,
            }),
            new TextRun({
              text: cat.items.join(", "),
              size: FONT.body,
              color: colors.foreground,
              ...runOpts,
            }),
          ],
          spacing: { after: SPACE.afterSkillItem },
          indent: { left: indentLeftTwip },
        })
      );
    }
    children.push(
      new Paragraph({
        spacing: { after: SPACE.afterBlock },
      })
    );
  }

  if (data.experience.length > 0) {
    const experience = sortExperienceByDateDesc(data.experience);

    children.push(sectionSeparatorParagraph());
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Experiência Profissional",
            bold: true,
            size: FONT.section,
            color: colors.foreground,
            ...runOpts,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { after: SPACE.afterSectionTitle },
      })
    );

    experience.forEach((exp, expIndex) => {
      const dateEnd =
        exp.isCurrent || !exp.endDate
          ? "Presente"
          : formatResumeDateBr(exp.endDate);

      const jobMetaParts: string[] = [];
      if (exp.company) jobMetaParts.push(exp.company);
      if (exp.location) jobMetaParts.push(exp.location);
      jobMetaParts.push(`${formatResumeDateBr(exp.startDate)} – ${dateEnd}`);
      const jobMetaRun = new TextRun({
        text: jobMetaParts.length > 0 ? ` | ${jobMetaParts.join(" | ")}` : "",
        size: FONT.meta,
        color: colors.foreground,
        ...runOpts,
      });
      const isFirstJob = expIndex === 0;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: (exp.jobTitle || "—") + " ",
              bold: true,
              size: FONT.body,
              color: colors.foreground,
              ...runOpts,
            }),
            jobMetaRun,
          ],
          spacing: {
            before: isFirstJob
              ? SPACE.afterSectionTitle
              : SPACE.afterExperienceItem,
            after: SPACE.afterJobLine,
          },
        })
      );

      const bullets = exp.description
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      for (let i = 0; i < bullets.length; i++) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${bullets[i]}`,
                size: FONT.body,
                color: colors.foreground,
                ...runOpts,
              }),
            ],
            spacing: {
              before: i === 0 ? SPACE.beforeBulletList : undefined,
              after: SPACE.bulletGap,
            },
            indent: { left: indentLeftTwip },
          })
        );
      }
      children.push(
        new Paragraph({
          spacing: { after: SPACE.afterExperienceItem },
        })
      );
    });
  }

  if (data.education.length > 0) {
    const education = sortEducationByDateDesc(data.education);

    children.push(sectionSeparatorParagraph());
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Formação",
            bold: true,
            size: FONT.section,
            color: colors.foreground,
            ...runOpts,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { after: SPACE.afterSectionTitle },
      })
    );

    education.forEach((edu, eduIndex) => {
      const dateEnd =
        edu.isCurrent || !edu.completionDate
          ? "Presente"
          : formatResumeDateBr(edu.completionDate);
      const eduMetaParts: string[] = [];
      if (edu.institution) eduMetaParts.push(edu.institution);
      if (edu.level) eduMetaParts.push(edu.level);
      eduMetaParts.push(`${formatResumeDateBr(edu.startDate)} – ${dateEnd}`);

      const eduMetaRun = new TextRun({
        text: eduMetaParts.length > 0 ? ` | ${eduMetaParts.join(" | ")}` : "",
        size: FONT.meta,
        color: colors.foreground,
        ...runOpts,
      });
      const isFirstEdu = eduIndex === 0;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: (edu.course || "—") + " ",
              bold: true,
              size: FONT.body,
              color: colors.foreground,
              ...runOpts,
            }),
            eduMetaRun,
          ],
          spacing: {
            before: isFirstEdu
              ? SPACE.afterSectionTitle
              : SPACE.afterExperienceItem,
            after: SPACE.afterJobLine,
          },
        })
      );

      if (edu.description) {
        const eduBullets = edu.description
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        for (let i = 0; i < eduBullets.length; i++) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${eduBullets[i]}`,
                  size: FONT.body,
                  color: colors.foreground,
                  ...runOpts,
                }),
              ],
              spacing: {
                before: i === 0 ? SPACE.beforeBulletList : undefined,
                after: SPACE.bulletGap,
              },
              indent: { left: indentLeftTwip },
            })
          );
        }
      }
      children.push(
        new Paragraph({
          spacing: { after: SPACE.afterExperienceItem },
        })
      );
    });
  }

  const marginTwip = convertInchesToTwip(MARGIN_IN);
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_FAMILY },
        },
        heading2: {
          run: { color: colors.foreground, font: FONT_FAMILY },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginTwip,
              right: marginTwip,
              bottom: marginTwip,
              left: marginTwip,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
