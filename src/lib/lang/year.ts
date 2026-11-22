/**
 * B18 — Rashifal 2027 in the regional languages. The numbers, dates, houses and tones
 * come from the SAME engine as the English and Hindi pages (computeYearReading, its
 * structured fields); the language pack (copy/<code>.ts year2027) supplies the words.
 */
import { computeYearReading } from '../year2027/reading';
import { RASHIS } from '../vedic/rashifal';
import { PLANET_NUMBER } from '../year2027/text';
import type { YPlanet } from '../year2027/sky';
import type { ColourKey, FaqQA, Graha, LangCode, LangCopy, LangVocab, Tone } from './types';
import { colourKeyOfRashi } from './daily';

const PLANET_COLOUR_KEY: Record<YPlanet, ColourKey> = { Sun: 'copperRed', Mercury: 'green', Venus: 'white', Mars: 'red', Jupiter: 'yellow', Saturn: 'darkBlue', Rahu: 'smokyGrey', Ketu: 'grey' };

export interface LangYearView {
  name: string;
  tone: Tone;
  headline: string;
  brief: string[];
  facts: Array<{ label: string; value: string }>;
  transits: Array<{ key: string; planet: string; sign: string; house: string; when: string; tone: Tone; toneLabel: string }>;
  areas: Array<{ key: string; title: string; tone: Tone; text: string; reasons: string[] }>;
  months: Array<{ key: number; name: string; tone: Tone; verdict: string; text: string }>;
  best: Array<{ range: string; why: string }>;
  hard: Array<{ range: string; why: string }>;
  love: Array<{ range: string; why: string }>;
  saturn: { text: string; rows: Array<{ when: string; label: string }> };
  eclipses: Array<{ name: string; date: string; time: string; house: string; text: string }>;
  lucky: { months: string; colours: string; numbers: string; day: string; text: string };
  remedies: string[];
  faq: FaqQA[];
}

const toneT3 = (t: Tone) => (t === 'favourable' ? 'good' : t === 'challenging' ? 'care' : 'mixed') as 'good' | 'mixed' | 'care';

export function composeYearLang(code: LangCode, v: LangVocab, cp: LangCopy, idx: number): LangYearView {
  const r = computeYearReading(idx, 'vedic', 'en');
  const Y = cp.year2027;
  const U = Y.ui;
  const g = (p: YPlanet | Graha) => v.grahas[p as Graha];
  const short = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${v.months[m - 1]}`; };
  const long = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${v.months[m - 1]} ${y}`; };
  const range = (a: string, b: string) => (a.endsWith('-01-01') && b.endsWith('-12-31') ? U.allYear : `${short(a)} – ${short(b)}`);
  const span = (a: string, b: string) => {
    const s = a.endsWith('-01-01'), e = b.endsWith('-12-31');
    if (s && e) return U.allYear;
    if (s) return U.until(short(b));
    if (e) return U.from(short(a));
    return `${short(a)} – ${short(b)}`;
  };
  const name = v.rashis[idx];
  const word = (t: Tone) => v.toneWord[toneT3(t)];
  const headline = Y.headline(name, r.tone);

  // Brief: the slow planets' segments, then plain-language summary.
  const segs = (p: YPlanet) => r.transits.filter(t => t.planet === p).map(t => ({ planet: g(p), house: t.house, span: span(t.from, t.to) }));
  const areas = r.areas.map(a => {
    const dom = Y.domain[a.key];
    return {
      key: a.key, title: dom.title, tone: a.tone, text: dom.text[a.tone],
      reasons: (a.factors ?? []).map(f => `${g(f.p)} — ${v.housesIn[f.h]} (${v.houseAreas[f.h]}), ${f.spans.map(([x, y]) => span(x, y)).join(' + ')}`),
    };
  });
  const brief = [
    `${headline} ${Y.briefSlow({ name, jupiter: segs('Jupiter'), saturn: segs('Saturn'), rahu: segs('Rahu'), ketu: segs('Ketu') })}`,
    Y.briefPlain({
      good: areas.filter(a => a.tone === 'favourable').map(a => a.title),
      care: areas.filter(a => a.tone === 'challenging').map(a => a.title),
      best: r.best[0] ? range(r.best[0].from, r.best[0].to) : undefined,
      hardest: r.challenging[0] ? range(r.challenging[0].from, r.challenging[0].to) : undefined,
    }),
  ];

  const win = (ws: typeof r.best) => ws.map(w => ({ range: range(w.from, w.to), why: Y.windowWhy((w.bits ?? []).map(b => ({ planet: g(b.p), house: b.h }))) }));

  const months = r.months.map(m => {
    const evs = (m.events ?? []).map(e => {
      const d = short(e.iso);
      if (e.kind === 'ingress') return Y.ingress(d, g(e.p!), e.h, e.t!);
      if (e.kind === 'retro') return Y.retro(d, g(e.p!), e.h, short(e.to!));
      if (e.kind === 'direct') return Y.direct(d, g(e.p!), e.h);
      return Y.eclipseEvent(d, !!e.solar, e.h);
    });
    const lead = m.lead!;
    const text = [evs.length ? '' : Y.mainInfluence(g(lead.p), lead.h), ...evs, Y.houseTip[lead.h]].filter(Boolean).join(' ');
    return { key: m.month, name: v.months[m.month], tone: m.tone, verdict: Y.monthVerdict[m.verdictKey ?? 'mixed'], text };
  });

  const satLabel = (h: number) => (h === 12 ? Y.saturnLabel.rising : h === 1 ? Y.saturnLabel.peak : h === 2 ? Y.saturnLabel.setting : h === 4 ? Y.saturnLabel.kantaka : h === 8 ? Y.saturnLabel.ashtama : Y.saturnLabel.none(h));
  const satRows = r.saturn.rows.map(x => ({ when: range(x.from, x.to), label: satLabel(x.house) }));
  const ssSpan = r.saturn.ssSpan ? `${long(r.saturn.ssSpan.start)} – ${long(r.saturn.ssSpan.end)}` : undefined;
  const saturnText = Y.saturnText({ status: r.saturn.status, rows: satRows.map(x => `${x.label} (${x.when})`).join('; '), name, span: r.saturn.status === 'sadeSati' ? ssSpan : undefined });

  const eclipses = r.eclipses.map(e => ({
    name: Y.eclipseName(e.body === 'solar', e.type ?? ''),
    date: long(e.date), time: e.time, house: v.houses[e.house],
    text: Y.eclipseText(e.house, [1, 4, 7, 10].includes(e.house), e.india),
  }));

  const rashi = RASHIS[idx];
  const helper = (r.lucky.helper ?? 'Jupiter') as YPlanet;
  const luckyMonths = (r.lucky.monthIdx ?? []).map(m => v.months[m]).join(', ');
  const colours = Array.from(new Set([v.colours[colourKeyOfRashi(idx)], v.colours[PLANET_COLOUR_KEY[helper]]])).join(', ');
  const day = v.varas[r.lucky.weekday ?? 0];
  const luckyText = Y.luckyText({
    months: luckyMonths, colour: v.colours[colourKeyOfRashi(idx)], numbers: rashi.luckyNumbers.join(', '),
    helper: g(helper), helperColour: v.colours[PLANET_COLOUR_KEY[helper]], helperNumber: PLANET_NUMBER[helper],
    lord: g(rashi.lord as Graha), day,
  });

  const remedies: string[] = [];
  if (r.saturn.status === 'sadeSati') remedies.push(cp.remedies.sadeSati);
  else if (r.saturn.status === 'dhaiya') remedies.push(cp.remedies.dhaiya);
  for (const p of r.remedyPlanets) if (!(p === 'Saturn' && r.saturn.status !== 'none')) remedies.push(`${g(p)}: ${cp.remedies[p as Graha]}`);

  const satShort = r.saturn.status === 'none' ? `${U.ssNo}. ${saturnText}` : saturnText;
  const lists = (ws: typeof r.best) => ws.map(w => range(w.from, w.to)).join(', ');
  const faq = Y.faq({
    name, headline,
    saturn: satShort,
    months: luckyMonths,
    best: lists(r.best) || U.allYear,
    hard: r.challenging.length ? `${lists(r.challenging)}.` : '',
    career: areas.find(a => a.key === 'career')!.text,
    money: areas.find(a => a.key === 'money')!.text,
    love: `${areas.find(a => a.key === 'love')!.text}${r.loveWindows.length ? ` (${lists(r.loveWindows)})` : ''}`,
  });

  return {
    name, tone: r.tone, headline, brief,
    facts: [
      { label: U.moonSign, value: `${name} — ${g(rashi.lord as Graha)}` },
      { label: U.status, value: r.saturn.status === 'sadeSati' ? U.ssYes : r.saturn.status === 'dhaiya' ? U.dhYes : U.ssNo },
      { label: U.bestStretch, value: r.best[0] ? range(r.best[0].from, r.best[0].to) : '—' },
      { label: U.careStretch, value: r.challenging[0] ? range(r.challenging[0].from, r.challenging[0].to) : '—' },
      { label: U.luckyMonths, value: luckyMonths },
    ],
    transits: r.transits.map(t => ({ key: t.planet + t.from, planet: g(t.planet), sign: v.rashis[t.signIdx ?? 0], house: v.houses[t.house], when: range(t.from, t.to), tone: t.tone, toneLabel: word(t.tone) })),
    areas, months,
    best: win(r.best), hard: win(r.challenging), love: win(r.loveWindows),
    saturn: { text: saturnText, rows: satRows },
    eclipses,
    lucky: { months: luckyMonths, colours, numbers: Array.from(new Set([...rashi.luckyNumbers, PLANET_NUMBER[helper]])).sort((a, b) => a - b).join(', '), day, text: luckyText },
    remedies,
    faq,
  };
}
