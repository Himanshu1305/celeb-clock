import { palette } from '../../theme/palette';
/**
 * Central design system — the single source of truth for the five themes.
 * (Run 1 of the central-system migration; see docs/part-ap-design-system.md.)
 *
 * A page selects its theme with the `data-theme` attribute on its `.paj` root
 * (see PajPage). The CSS variable values below mirror the proven `.paj` tokens in
 * src/styles/part-aj.css and are emitted as `[data-theme=…]` rules in
 * src/styles/central/themes.css — keep the two in sync (the unit test guards it).
 */
export const THEMES = ['vedic', 'birthday', 'mystic', 'science', 'neutral'] as const;
export type Theme = (typeof THEMES)[number];

export interface ThemeTokens {
  /** decorative accent (rules, dots, chart lines) */
  accent: string;
  /** accessible text shade of the accent (eyebrows, emphasis) */
  accentText: string;
  /** secondary decorative (science wellness curve) */
  green: string;
  /** page background */
  bg: string;
  /** hairline / rule colour */
  line: string;
}

export const THEME_TOKENS: Record<Theme, ThemeTokens> = {
  vedic: { accent: palette.gold, accentText: palette.goldInk, green: palette.gold, bg: palette.ivory, line: palette.line },
  birthday: { accent: palette.coral, accentText: palette.coralInk, green: palette.coral, bg: palette.ivory, line: palette.line },
  mystic: { accent: palette.purple, accentText: palette.purple, green: palette.purple, bg: palette.ivory, line: palette.line },
  science: { accent: palette.blue, accentText: palette.greenInk, green: palette.green, bg: '#FFFFFF', line: palette.lineCool },
  neutral: { accent: palette.gold, accentText: palette.navy, green: palette.navy, bg: palette.ivory, line: palette.line },
};

/** The seven central page layouts and the `.paj` hero variant each maps to. */
export const LAYOUTS = ['tool', 'report', 'hub', 'collection', 'article', 'money', 'utility'] as const;
export type LayoutName = (typeof LAYOUTS)[number];
