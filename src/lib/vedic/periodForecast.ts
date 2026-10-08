/**
 * Period-structured predictions — Growth P2 (P2-1, improvements GP2-PERIOD-PREDICT).
 *
 * Re-presents the already-computed Vimshottari Dasha timeline as explicit
 * YEARLY, QUARTERLY and MONTHLY forecasts. Each period names the governing
 * Dasha chain (Maha→Antar→Pratyantar), grades its support strong/moderate/mild
 * from the governing lord's house-rulership and natural nature, and says which
 * life area it most activates (Rule 7: clear, graded, reasoned, attributed).
 *
 * Client-safe and date-dependent (computed against `now`, Rule 13). Introduces
 * NO new astronomy — it reuses whatsAhead's activeChainAt + SIGN_LORDS. Strict
 * guardrails: never a specific date for marriage/illness/death, never fear; a
 * "mild" grade means a gentler/consolidating period, never a bad one.
 */
import { SIGN_LORDS, activeChainAt, type MahaPeriod } from './whatsAhead';

export type { MahaPeriod };

const NATURAL_BENEFIC = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);

export type ForecastGrade = 'strong' | 'moderate' | 'mild';

export interface ForecastPeriod {
  label: string;
  start: string; end: string;
  maha: string | null;
  antar: string | null;
  pratyantar: string | null;
  grade: ForecastGrade;
  area: string;         // life area most activated
  lead: string;         // the clear answer
  reason: string;       // the reason from the chart
}

export interface PeriodForecast {
  yearly: ForecastPeriod[];
  quarterly: ForecastPeriod[];
  monthly: ForecastPeriod[];
  note: string;
}

/** Houses (1-based) a planet rules, given the lagna sign index (0-based). */
function housesRuled(planet: string, lagnaSignIndex: number): number[] {
  const out: number[] = [];
  for (let h = 1; h <= 12; h++) {
    const signIdx = (((lagnaSignIndex + (h - 1)) % 12) + 12) % 12;
    if (SIGN_LORDS[signIdx] === planet) out.push(h);
  }
  return out;
}

const AREA_BY_HOUSE: Record<number, string> = {
  1: 'self & vitality', 2: 'wealth & family', 3: 'effort & communication', 4: 'home & comfort',
  5: 'creativity, children & learning', 6: 'work, service & health matters', 7: 'partnership',
  8: 'change & shared resources', 9: 'fortune, travel & higher learning', 10: 'career & standing',
  11: 'gains & networks', 12: 'retreat, expenses & foreign lands',
};

function gradeLord(lord: string | null, lagnaSignIndex: number): { grade: ForecastGrade; area: string; houses: number[] } {
  if (!lord) return { grade: 'mild', area: 'a quiet, transitional', houses: [] };
  const houses = housesRuled(lord, lagnaSignIndex);
  let score = 0;
  for (const h of houses) {
    if (h === 1 || h === 5 || h === 9) score += 2;         // trikona
    else if (h === 4 || h === 7 || h === 10) score += 1.5; // kendra
    else if (h === 2 || h === 11) score += 1;              // wealth/gains
    else if (h === 6 || h === 8 || h === 12) score -= 1;   // dusthana
  }
  score += NATURAL_BENEFIC.has(lord) ? 0.5 : -0.25;
  const grade: ForecastGrade = score >= 2.5 ? 'strong' : score >= 0.5 ? 'moderate' : 'mild';
  // Primary area = the most auspicious house the lord rules (else its first house).
  const priority = [10, 9, 5, 1, 7, 4, 11, 2, 3, 6, 8, 12];
  const primary = priority.find(h => houses.includes(h)) ?? houses[0];
  return { grade, area: primary ? AREA_BY_HOUSE[primary] : 'general', houses };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmt(ms: number): string { const d = new Date(ms); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; }

function gradePhrase(g: ForecastGrade): string {
  return g === 'strong' ? 'a strongly supportive' : g === 'moderate' ? 'a moderately supportive' : 'a gentler, consolidating';
}

function build(timeline: MahaPeriod[], lagnaSignIndex: number, label: string, startMs: number, endMs: number): ForecastPeriod {
  const midMs = Math.floor((startMs + endMs) / 2);
  const chain = activeChainAt(timeline, midMs);
  // Governing lord for the grade: the finest active level that exists (antar preferred).
  const governing = chain.antar || chain.maha;
  const { grade, area } = gradeLord(governing, lagnaSignIndex);
  const lead = `${label}: ${gradePhrase(grade)} period, most active in ${area}.`;
  const chainStr = [chain.maha, chain.antar, chain.pratyantar].filter(Boolean).join(' → ');
  const reason = `Vedic astrology reads this from your running Dasha${chainStr ? ` (${chainStr})` : ''}${governing ? ` — the governing period lord ${governing} rules matters of ${area} in your chart` : ''}. Treat it as the prevailing theme and energy, not a fixed event.`;
  return { label, start: new Date(startMs).toISOString(), end: new Date(endMs).toISOString(), maha: chain.maha, antar: chain.antar, pratyantar: chain.pratyantar, grade, area, lead, reason };
}

const DAY = 86_400_000;

export function buildPeriodForecast(timeline: MahaPeriod[], lagnaSignIndex: number, nowMs: number): PeriodForecast {
  // Yearly: this year + next two (calendar years from now).
  const yearly: ForecastPeriod[] = [];
  const nowYear = new Date(nowMs).getUTCFullYear();
  for (let i = 0; i < 3; i++) {
    const y = nowYear + i;
    const start = i === 0 ? nowMs : Date.UTC(y, 0, 1);
    const end = Date.UTC(y + 1, 0, 1);
    yearly.push(build(timeline, lagnaSignIndex, i === 0 ? `Rest of ${y}` : `${y}`, start, end));
  }

  // Quarterly: next 4 quarters of ~91 days.
  const quarterly: ForecastPeriod[] = [];
  for (let q = 0; q < 4; q++) {
    const start = nowMs + q * 91 * DAY;
    const end = start + 91 * DAY;
    quarterly.push(build(timeline, lagnaSignIndex, q === 0 ? 'This quarter' : `In ${q * 3}–${q * 3 + 3} months`, start, end));
  }

  // Monthly: next 12 months of ~30 days.
  const monthly: ForecastPeriod[] = [];
  for (let m = 0; m < 12; m++) {
    const start = nowMs + m * 30 * DAY;
    const end = start + 30 * DAY;
    monthly.push(build(timeline, lagnaSignIndex, `${fmt(start)}`, start, end));
  }

  return {
    yearly, quarterly, monthly,
    note: 'Each period names your running Vimshottari Dasha (planetary period) and grades how supportive it is, from your chart. A "mild" grade means a gentler, consolidating phase — never a bad one. These are themes and timing, never specific dated events; marriage, health and similar sensitive matters are only ever described as favourable windows, never as fixed dates.',
  };
}
