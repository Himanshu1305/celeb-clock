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
  vedic: { accent: '#C6A15B', accentText: '#806125', green: '#C6A15B', bg: '#FAF7F0', line: '#E4DCC8' },
  birthday: { accent: '#F0715A', accentText: '#B5432A', green: '#F0715A', bg: '#FAF7F0', line: '#E4DCC8' },
  mystic: { accent: '#6E5AA6', accentText: '#6E5AA6', green: '#6E5AA6', bg: '#FAF7F0', line: '#E4DCC8' },
  science: { accent: '#2F6FB0', accentText: '#237A60', green: '#2E9E7B', bg: '#FFFFFF', line: '#DDE4EA' },
  neutral: { accent: '#C6A15B', accentText: '#0E2238', green: '#0E2238', bg: '#FAF7F0', line: '#E4DCC8' },
};

/** The seven central page layouts and the `.paj` hero variant each maps to. */
export const LAYOUTS = ['tool', 'report', 'hub', 'collection', 'article', 'money', 'utility'] as const;
export type LayoutName = (typeof LAYOUTS)[number];
