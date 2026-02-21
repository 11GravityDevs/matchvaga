/**
 * Project-wide design tokens.
 * Single source of truth for spacing, typography, layout, and radius.
 * Use these constants instead of arbitrary Tailwind values.
 *
 * Aligned with design-system.mdc.
 */

// ─── Layout widths (use with w-form, w-content, etc. from theme) ───
/** Form/card width: 900px */
export const W_FORM = "w-form";

/** Content width for wide layouts: 1100px */
export const W_CONTENT = "w-content";

/** Max width for content (centered layouts): 1100px */
export const MAX_W_CONTENT = "max-w-content";

/** Sidebar width: 280px (current implementation) */
export const W_SIDEBAR = "w-sidebar";

/** Column width in two-column layouts: 380px */
export const W_COLUMN = "w-column";

/** Action column width in tables: 100px */
export const W_ACTION = "w-25";

/** Max width for hero title */
export const MAX_W_HERO_TITLE = "max-w-hero-title";

/** Max width for hero description */
export const MAX_W_HERO_DESC = "max-w-hero-desc";

/** Max width for login form */
export const MAX_W_LOGIN_FORM = "max-w-login-form";

// ─── Page layout ───
/** Page-level container padding */
export const PAGE_PADDING = "px-10 py-12";

/** Gap between major sections */
export const SECTION_GAP = "gap-10";

/** Gap between columns in two-column layouts */
export const COLUMN_GAP = "gap-10";

// ─── Typography (design system scale) ───
/** Page title (h1) — 28px */
export const PAGE_TITLE_CLASS =
  "text-[28px] leading-tight font-bold tracking-[-0.5px] text-foreground";

/** Page subtitle / description */
export const PAGE_SUBTITLE_CLASS =
  "text-base font-normal text-muted-foreground";

/** Section header (h2) — 18px */
export const SECTION_HEADER_CLASS = "text-lg font-bold text-foreground";

/** Card title — 22px */
export const CARD_TITLE_CLASS =
  "text-[22px] font-bold leading-[1.3] text-foreground";

/** Card description — 14px */
export const CARD_DESCRIPTION_CLASS =
  "text-sm leading-[1.4] text-muted-foreground";

/** Small text / CTA — 13px (design system) */
export const TEXT_SMALL = "text-[13px]";

/** Small text with normal line height */
export const TEXT_SMALL_LEADING = "text-[13px] leading-normal";

/** Small text with medium weight */
export const TEXT_SMALL_MEDIUM = "text-[13px] font-medium";

/** Small text with semibold weight */
export const TEXT_SMALL_SEMIBOLD = "text-[13px] font-semibold";

/** Caption — 12px, 1.33 line height */
export const TEXT_CAPTION_LEADING = "text-xs leading-[1.33]";

/** Section title in forms — 20px */
export const SECTION_TITLE_CLASS = "text-[20px] font-bold text-foreground";

/** Section item label — 15px */
export const SECTION_ITEM_LABEL_CLASS = "text-[15px] font-bold text-foreground";

/** Form field label — 13px */
export const FORM_LABEL_CLASS = "text-[13px] font-medium text-foreground";

/** Sub label — 12px */
export const SUB_LABEL_CLASS = "text-xs font-medium text-foreground";

/** KPI value — 32px */
export const TEXT_KPI =
  "text-[32px] leading-none font-semibold text-foreground";

/** Score display — 44px */
export const TEXT_SCORE = "text-[44px] leading-none font-bold text-foreground";

/** Hero title — 48px */
export const TEXT_HERO =
  "text-[42px] leading-[1.1] font-bold tracking-[-0.5px]";

/** Badge/caption small — 11px */
export const TEXT_BADGE = "text-[11px] leading-[1.33] font-semibold";

// ─── Card layout ───
/** Card header padding */
export const CARD_HEADER_PADDING = "px-7 py-6";

/** Card content padding — 28px */
export const CARD_CONTENT_PADDING = "p-7";

/** Card border radius */
export const CARD_RADIUS = "rounded-xl";

/** Canonical card base: rounded, bordered, white background (no shadow) */
export const CARD_BASE = "rounded-xl border border-border bg-card";

/** Table/cell padding */
export const TABLE_CELL_PADDING = "p-4";

/** Tip banner padding */
export const TIP_BANNER_PADDING = "px-4 py-3";

/** Footer action row padding */
export const FOOTER_PADDING = "px-10 py-4";

// ─── Radius (use scale only) ───
/** Small radius — 6px */
export const RADIUS_SM = "rounded-md";

/** Medium radius — 8px */
export const RADIUS_MD = "rounded-lg";

/** Large radius — 12px */
export const RADIUS_LG = "rounded-xl";
