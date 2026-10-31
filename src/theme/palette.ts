/**
 * BornClock colour palette — the ONE place UI colours are named.
 *
 * ┌ How colour is wired ───────────────────────────────────────────────────────────────┐
 * │ src/index.css `:root`  --brand-<name>: R G B   ← SOURCE OF TRUTH for every token   │
 * │ tailwind.config.ts     brand-<name> → rgb(var(--brand-<name>) / <alpha-value>)     │
 * │                        e.g. text-brand-purple, bg-brand-navy/10, from-brand-blue   │
 * │ src/styles/part-aj.css .paj --navy/--accent/… = rgb(var(--brand-…))  (generator)   │
 * │ this file              `palette` (hex) for places that need a raw string: canvas,  │
 * │                        SVG attributes, html2canvas cards, email/PDF HTML, charts;  │
 * │                        `brandVar` (CSS-variable strings) for inline React styles.  │
 * └────────────────────────────────────────────────────────────────────────────────────┘
 *
 * To change a brand colour: edit its `--brand-*` line in src/index.css AND the matching
 * hex below (src/theme/__tests__/palette.test.ts fails until both agree). Everything else
 * — every Tailwind class, inline style, paj page, PDF and share card — follows.
 *
 * `ui` holds secondary, non-brand colours that were hard-coded in inline styles / SVG
 * attributes (report dark panels, planet art, chart series…). They are plain hex (no CSS
 * variable) but live here so they are findable and changeable in one place.
 */

/** Core brand tokens. Each key `fooBar` ⇄ CSS var `--brand-foo-bar` ⇄ Tailwind `brand-foo-bar`. */
const PALETTE = {
  // Navy / ink family
  navy: '#0E2238', // primary navy: headers, dark bands, primary buttons
  navyHover: '#1A3450', // hover state of navy buttons
  ink: '#1A2230', // body ink on ivory (paj --ink)
  inkSoft: '#3A4A5A', // softer body ink (report)
  muted: '#5B6472', // paj --muted (secondary text)
  // Surfaces & lines
  ivory: '#FAF7F0', // page canvas (paj --bg)
  paper: '#FFFFFF', // card surface (paj --paper)
  line: '#E4DCC8', // warm hairline (paj --line)
  lineCool: '#DDE4EA', // science-theme hairline
  lineBlue: '#D7E1EA', // report hairline
  mist: '#F1F6FA', // pale blue panel
  // Mystic purple
  purple: '#6E5AA6',
  purpleLight: '#B4A6DB', // purple on dark backgrounds
  purplePale: '#C9BFF0',
  purpleDark: '#4C3E78', // purple text on light tints
  purpleInk: '#4B3D80',
  purpleDeep: '#4B3A8C',
  // Science blue
  blue: '#2F6FB0',
  blueLight: '#7FB0E0', // blue on dark backgrounds
  blueDark: '#103A5C',
  // Vedic gold
  gold: '#C6A15B',
  goldHover: '#B8914B',
  goldDeep: '#B8862F',
  goldInk: '#74571E', // gold text on ivory (paj vedic --accent-text)
  goldText: '#5C4620',
  // Birthday coral
  coral: '#F0715A',
  coralInk: '#B5432A',
  // Greens
  green: '#2E9E7B', // science --green
  greenInk: '#237A60',
  whatsapp: '#1EBE5D', // WhatsApp button hover
} as const;

export type BrandToken = keyof typeof PALETTE;
/** Brand tokens as hex strings (typed `string` so values can be reassigned to plain string vars). */
export const palette: { readonly [K in BrandToken]: string } = PALETTE;

/** `fooBar` → `foo-bar` (the CSS-variable / Tailwind suffix of a token). */
export const tokenSlug = (k: string): string => k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

/** `brandVar.navy === 'rgb(var(--brand-navy))'` — use in inline `style={{}}` so the value
 *  tracks src/index.css at runtime (identical computed colour to the hex). */
export const brandVar = Object.fromEntries(
  Object.keys(palette).map(k => [k, `rgb(var(--brand-${tokenSlug(k)}))`]),
) as { readonly [K in BrandToken]: string };

/** Secondary UI colours (hex only, no CSS variable). Tailwind-palette equivalents are named
 *  after their Tailwind class; the rest by role. Case is preserved where a library matches
 *  the literal string (e.g. Recharts grid `stroke='#ccc'` styled by ui/chart.tsx). */
const UI = {
  // Tailwind palette equivalents
  slate400: '#94A3B8',
  slate600: '#475569',
  slate900: '#0F172A',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray900: '#111827',
  green500: '#22c55e',
  red500: '#ef4444',
  red600: '#DC2626',
  amber500: '#F59E0B',
  amber600: '#D97706',
  blue500: '#3b82f6',
  blue600: '#2563EB',
  rose500: '#f43f5e',
  green700: '#15803D',
  indigo900: '#312E81',
  indigo950: '#1E1B4B',
  // Birthday report ("bb") design
  reportInk: '#0C1A2B',
  reportMuted: '#6B7A89',
  reportCode: '#9DB0BF',
  reportRule: '#9FB2C2',
  reportDashed: '#c7cfd8',
  reportFootnote: '#b0b5bf',
  reportNegative: '#C0392B',
  reportDarkPanel: '#1A2B3C',
  reportDarkBorder: '#2A3B4C',
  goldSoft: '#F5EAD2',
  goldTint: '#FBF6EA',
  goldBorder: '#E6D8B8',
  goldBright: '#E7C877',
  goldBronze: '#A8842C',
  // Homepage
  homeBody: '#3E4759',
  homeInputBorder: '#D8D2C2',
  homeRule: '#EFE9DA',
  homeFooterLink: '#B9C2CF',
  goldOnDark: '#D9BC82',
  coralOnDark: '#F7A08E',
  purpleOnDark: '#B3A4DE',
  blueOnDark: '#8FC1E6',
  // Fallback used by vedic widgets: var(--muted, #667)
  mutedFallback: '#667',
  // Dark gradients
  navyMid: '#14314f',
  navyLight: '#1d4a74',
  spaceBlack: '#07071a',
  spaceDeep: '#0a0e1a',
  spaceViolet: '#1a1040',
  spaceNavy: '#0d1a2e',
  tarotNight1: '#0f0c29',
  tarotNight2: '#302b63',
  tarotNight3: '#24243e',
  // Planet art / charts
  earthBlue: '#4fa3e0',
  sunYellow: '#FDB813',
  chartPurple: '#8884d8',
  chartGrid: '#ccc',
  chartGridLight: '#f0f0f0',
} as const;

export const ui: { readonly [K in keyof typeof UI]: string } = UI;
