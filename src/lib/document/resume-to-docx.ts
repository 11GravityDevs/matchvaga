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
  sortExperienceByDateDesc,
  sortEducationByDateDesc,
} from "@/utils/resume";
import {
  buildHeaderContactParagraphs,
  sectionSeparatorParagraph,
} from "./resume-to-docx-contact";

const TWIP = 20;
const pt = (n: number) => n * TWIP;

const colors = {
  foreground: "0A0A0A",
  border: "E5E5E5",
} as const;

const FONT = {
  name: 48,
  section: 24,
  body: 22,
  meta: 22,
} as const;

const FONT_FAMILY = "Helvetica";

const SECTION_GAP = pt(12);

const SPACE = {
  afterTitle: pt(16),
  afterContactLine: pt(10),
  afterContact: pt(24),
  afterHeaderBorder: SECTION_GAP,
  afterSectionTitle: SECTION_GAP,
  afterBlock: SECTION_GAP,
  afterJobLine: pt(4),
  beforeBulletList: pt(8),
  bulletGap: pt(4),
  afterExperienceItem: SECTION_GAP,
  afterSkillItem: SECTION_GAP,
} as const;

const INDENT_LEFT_PT = 18;
const indentLeftTwip = INDENT_LEFT_PT * TWIP;

const MARGIN_IN = 0.75;

export async function buildResumeDocx(data: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];
  const skillsForDisplay = getSkillsByCategoryForDisplay(data);
  const runOpts = { font: FONT_FAMILY } as const;

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.fullName || "—",
          bold: true,
          size: FONT.name,
          ...runOpts,
        }),
      ],
      alignment: "center",
      spacing: { after: SPACE.afterTitle },
    })
  );
  children.push(
    ...buildHeaderContactParagraphs(data, {
      SPACE,
      colors,
      FONT,
      FONT_FAMILY,
    })
  );

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
    children.push(
      sectionSeparatorParagraph(SECTION_GAP, SECTION_GAP, colors.border)
    );
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

    children.push(
      sectionSeparatorParagraph(SECTION_GAP, SECTION_GAP, colors.border)
    );
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

      const jobMetaPartsNoDate: string[] = [];
      if (exp.company) jobMetaPartsNoDate.push(exp.company);
      if (exp.location) jobMetaPartsNoDate.push(exp.location);
      const jobDateRange = `${formatResumeDateBr(exp.startDate)} – ${dateEnd}`;
      const jobMetaPrefix =
        jobMetaPartsNoDate.length > 0
          ? ` | ${jobMetaPartsNoDate.join(" | ")} | `
          : " | ";
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
            new TextRun({
              text: jobMetaPrefix,
              size: FONT.meta,
              color: colors.foreground,
              ...runOpts,
            }),
            new TextRun({
              text: jobDateRange,
              italics: true,
              size: FONT.meta,
              color: colors.foreground,
              ...runOpts,
            }),
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

    children.push(
      sectionSeparatorParagraph(SECTION_GAP, SECTION_GAP, colors.border)
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Educação",
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
      const eduMetaPartsNoDate: string[] = [];
      if (edu.institution) eduMetaPartsNoDate.push(edu.institution);
      if (edu.level) eduMetaPartsNoDate.push(edu.level);
      const eduDateRange = `${formatResumeDateBr(edu.startDate)} – ${dateEnd}`;
      const eduMetaPrefix =
        eduMetaPartsNoDate.length > 0
          ? ` | ${eduMetaPartsNoDate.join(" | ")} | `
          : " | ";
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
            new TextRun({
              text: eduMetaPrefix,
              size: FONT.meta,
              color: colors.foreground,
              ...runOpts,
            }),
            new TextRun({
              text: eduDateRange,
              italics: true,
              size: FONT.meta,
              color: colors.foreground,
              ...runOpts,
            }),
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
