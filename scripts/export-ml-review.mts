/**
 * B20 — Malayalam review sheet for a native speaker.
 *   npx tsx scripts/export-ml-review.mts
 * Writes docs/review/malayalam-review.csv and malayalam-review.xlsx (via scripts/ml-review-xlsx.py).
 * One row per user-visible Malayalam string; English meanings come from the code's own English
 * names where they exist (stars, signs, planets, tithis…) and from docs/review/ml-meanings.json.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mlStrings } from './lib-ml-strings.mts';
import { PANCHANG_TABLES } from '../src/lib/vedic/panchang';

const OUT = 'docs/review';
const MEANINGS: Record<string, string> = JSON.parse(readFileSync(`${OUT}/ml-meanings.json`, 'utf8'));
const RASHI = ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const KOLLAM = ['Chingam (Malayalam month)', 'Kanni', 'Thulam', 'Vrischikam', 'Dhanu', 'Makaram', 'Kumbham', 'Meenam', 'Medam', 'Edavam', 'Mithunam', 'Karkidakam'];
const KARANA = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];
const TARA = ['—', 'Janma tara', 'Sampat tara', 'Vipat tara', 'Kshema tara', 'Pratyak tara', 'Sadhaka tara', 'Vadha tara', 'Mitra tara', 'Parama Mitra tara'];
const WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

function meaning(id: string): string {
  if (MEANINGS[id]) return MEANINGS[id];
  const m = id.match(/^vocab\.(\w+)\.(\w+)$/);
  if (m) {
    const [, k, i] = m; const n = Number(i);
    if (k === 'nakshatras') return `${PANCHANG_TABLES.NAKSHATRAS[n]} (nakshatra)`;
    if (k === 'yogas') return `${PANCHANG_TABLES.YOGAS[n]} (yoga)`;
    if (k === 'rashis') return RASHI[n];
    if (k === 'houses') return `${ord(n)} house`;
    if (k === 'housesIn') return `in the ${ord(n)} house`;
    if (k === 'months') return MONTHS[n];
    if (k === 'regionalMonths') return KOLLAM[n];
    if (k === 'karanas') return `${KARANA[n]} (karana)`;
    if (k === 'taras') return TARA[n];
    if (k === 'varas') return WEEK[n];
    if (k === 'tithis') return `${i} (tithi)`;
    if (k === 'choghadiya') return `${i} (choghadiya)`;
  }
  return '';
}
const PAGES: Record<string, string> = {
  Kundali: 'https://bornclock.com/ml/jathaka-porutham/',
  Matching: 'https://bornclock.com/ml/jathaka-porutham/',
  Rashifal: 'https://bornclock.com/ml/rashifal/ · /ml/rashifal-2027/',
  Panchang: 'https://bornclock.com/ml/panchang/',
  Common: 'https://bornclock.com/ml/ (all Malayalam pages)',
};
export function rows() {
  return mlStrings().map(s => ({
    ID: s.id, Group: s.group, Page: PAGES[s.group], Malayalam: s.text.replace(/undefined/g, '{…}'),
    English: meaning(s.id), Context: s.context, Correct: '', Suggested: '', Notes: '',
  }));
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = rows();
  const missing = r.filter(x => !x.English).map(x => x.ID);
  if (missing.length) { console.error(`[ml-review] ${missing.length} strings have no English meaning:\n${missing.join('\n')}`); process.exit(1); }
  mkdirSync(OUT, { recursive: true });
  const cols = ['ID', 'Page', 'Malayalam', 'English', 'Context', 'Correct', 'Suggested', 'Notes'] as const;
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = ['ID', 'Page URL(s)', 'Malayalam (current)', 'English meaning', 'Context', 'Correct? (Y/N)', 'Suggested Malayalam', 'Notes'];
  writeFileSync(`${OUT}/malayalam-review.csv`, '﻿' + [head.map(esc).join(','), ...r.map(x => cols.map(c => esc(x[c])).join(','))].join('\n'));
  writeFileSync(`${OUT}/.ml-review-rows.json`, JSON.stringify(r));
  execFileSync('python3', ['scripts/ml-review-xlsx.py', `${OUT}/.ml-review-rows.json`, `${OUT}/malayalam-review.xlsx`], { stdio: 'inherit' });
  console.log(`[ml-review] ${r.length} strings → ${OUT}/malayalam-review.xlsx and .csv`);
}
