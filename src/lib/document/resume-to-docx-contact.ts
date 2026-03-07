import {
  Paragraph,
  TextRun,
  ExternalHyperlink,
  BorderStyle,
  UnderlineType,
} from "docx";
import type { ParagraphChild } from "docx";
import type { ResumeData } from "@/types/resume";
import {
  formatLinkLabel,
  ensureAbsoluteUrl,
  getContactLine1ForDisplay,
} from "@/utils/resume";

export function headerBorderParagraph(
  after: number,
  borderColor: string
): Paragraph {
  return new Paragraph({
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        color: borderColor,
        size: 8,
        space: 1,
      },
    },
    spacing: { after },
  });
}

export function sectionSeparatorParagraph(
  before: number,
  after: number,
  borderColor: string
): Paragraph {
  return new Paragraph({
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        color: borderColor,
        size: 8,
        space: 1,
      },
    },
    spacing: { before, after },
  });
}

const FONT_FAMILY = "Helvetica";
const FONT_META = 22;
const COLORS = { foreground: "0A0A0A", link: "2563EB" } as const;

export function buildContactLine2Children(data: ResumeData): ParagraphChild[] {
  const runOpts = { font: FONT_FAMILY, size: FONT_META } as const;
  const linkRun = (text: string) =>
    new TextRun({
      text,
      color: COLORS.link,
      underline: { type: UnderlineType.SINGLE },
      ...runOpts,
    });
  const separatorRun = () =>
    new TextRun({ text: " | ", color: COLORS.foreground, ...runOpts });

  const out: ParagraphChild[] = [];
  if (data.linkedin?.trim()) {
    out.push(
      new ExternalHyperlink({
        link: ensureAbsoluteUrl(data.linkedin),
        children: [linkRun(formatLinkLabel(data.linkedin))],
      })
    );
    if (data.github?.trim() || data.email?.trim()) out.push(separatorRun());
  }
  if (data.github?.trim()) {
    out.push(
      new ExternalHyperlink({
        link: ensureAbsoluteUrl(data.github),
        children: [linkRun(formatLinkLabel(data.github))],
      })
    );
    if (data.email?.trim()) out.push(separatorRun());
  }
  if (data.email?.trim()) {
    out.push(
      new ExternalHyperlink({
        link: `mailto:${data.email.trim()}`,
        children: [linkRun(data.email.trim())],
      })
    );
  }
  return out;
}

export interface DocxHeaderOpts {
  SPACE: {
    afterContactLine: number;
    afterContact: number;
    afterHeaderBorder: number;
  };
  colors: { border: string; foreground: string };
  FONT: { meta: number };
  FONT_FAMILY: string;
}

export function buildHeaderContactParagraphs(
  data: ResumeData,
  opts: DocxHeaderOpts
): Paragraph[] {
  const { SPACE, colors, FONT, FONT_FAMILY } = opts;
  const runOpts = { font: FONT_FAMILY } as const;
  const contactLine1 = getContactLine1ForDisplay(data);
  const contactLine2Children = buildContactLine2Children(data);
  const hasContactLine2 = contactLine2Children.length > 0;

  const contactParagraph = (text: string, after: number) =>
    new Paragraph({
      children: [
        new TextRun({
          text,
          size: FONT.meta,
          color: colors.foreground,
          ...runOpts,
        }),
      ],
      alignment: "center",
      spacing: { after },
    });

  const out: Paragraph[] = [];
  if (contactLine1) {
    out.push(
      contactParagraph(
        contactLine1,
        hasContactLine2 ? SPACE.afterContactLine : SPACE.afterContact
      )
    );
  }
  if (hasContactLine2) {
    out.push(
      new Paragraph({
        children: contactLine2Children,
        alignment: "center",
        spacing: { after: SPACE.afterContact },
      })
    );
  }
  out.push(headerBorderParagraph(SPACE.afterHeaderBorder, colors.border));
  return out;
}
