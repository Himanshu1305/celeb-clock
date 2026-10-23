/**
 * Audit round 2 — K6, K7, K8 + optional marital status (AI chat / readings).
 *
 * Reference data:
 *  - P9 (founder's test chart: 13 May 1978 19:30 IST, Jammu; married June 2006) and the
 *    K6 finding "Ketu–Venus Aug 2005–Oct 2006 is the classical match" — round2.txt K6 and
 *    round2/CONTEXT.md.
 *  - Current transit signs on 17 Oct 2026 06:00 UTC — Swiss Ephemeris (pyswisseph,
 *    SIDM_LAHIRI, scratchpad/engine-audit venv): Saturn 346.08° Meena, Jupiter 118.06°
 *    Karka, mean Rahu 302.62° Kumbha (Ketu opposite → Simha).
 *  - K8 harmful strings: verbatim from round2.txt K8 and the audit probes
 *    round2/verify/c10.ts, c10b.ts. Rephrase behaviour = founder decision 23 Oct 2026.
 */
import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts, buildReadingUserPrompt } from '../readingPrompts';
import { ageInYears } from '../yogaTiming';
import {
  buildChatSystemPrompt, deterministicTimingReply, resolveMarriageContext, scanChatResponse,
  findExactDays, disallowedExactDays,
} from '../chatGuardrails';
import { rephraseHarmfulPredictions, findHarmfulPredictions } from '../harmfulPredictions';
import { buildNowContext, nowContextBlock, normaliseMaritalStatus } from '../chatNowContext';
import { buildChatReply } from '../../../../api/vedic-chat';
import { isValidProfile, mergeProfile, maritalStatusOf } from '../../../services/savedProfile';

const NOW = new Date('2026-10-17T06:00:00Z');
const P9 = { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.857, timezoneOffset: 5.5 };
const P9_BIRTH = new Date('1978-05-13T14:00:00Z');

async function p9() {
  const chart = await calculateBirthChart(P9, { includeShadbala: true, refDate: NOW });
  const ageYears = ageInYears(P9_BIRTH, NOW);
  return { chart, ageYears, facts: extractReadingFacts(chart, NOW, { ageYears, birth: P9_BIRTH }) };
}

// ── K8 ───────────────────────────────────────────────────────────────────────
// Words that must never survive a rephrase (death, diagnosis, certainty — all languages).
const FORBIDDEN = /\b(die|dies|dying|death|dead|pass(?:es)? away|loss of life|fatal|100 ?%|widow\w*|lifespan|illness|disease|cancer|definitely|certain(?:ly)?|guarantee\w*|will|vaidhavya|mrityu|maut|pakka|pakki|zaroor|durghatna|bimar)\b|मृत्यु|मौत|पक्क|विधवा|बीमार|दुर्घटना|ज़रूर/i;

// Founder-approved templates (23 Oct 2026).
const OWN_EN = "This is a sensitive period — take good care of your health, avoid unnecessary risks, and don't skip check-ups.";
const FAMILY_EN = 'Elders or family members may need more of your time and support in this period — stay close and keep an eye on their health.';
const TRAVEL_EN = 'Take extra care while travelling and driving in this period.';
const CHILD_EN = "Keep an eye on your child's routine health care in this period; regular check-ups are a good idea.";

const HARMFUL: Array<{ text: string; expect: string | RegExp; lang: 'en' | 'hi' | 'hinglish' }> = [
  // round2.txt K8 (the four quoted misses)
  { text: 'Your spouse is likely to pass away early.', expect: FAMILY_EN, lang: 'en' },
  { text: 'A major accident is indicated in Rahu antardasha.', expect: 'Take extra care while travelling and driving during your Rahu antardasha.', lang: 'en' },
  { text: 'Your child faces serious illness in this period.', expect: CHILD_EN, lang: 'en' },
  { text: 'Shaadi ke baad pati ki mrityu ka yog hai.', expect: /^Is samay parivaar ke badon[^.]*sehat ka dhyan rakhein\.$/, lang: 'hinglish' },
  { text: 'Aapki shaadi 2027 mein hi hogi, pakka.', expect: /^2027 ka samay shaadi ke liye anukool hai — yeh sambhavna ka samay hai/, lang: 'hinglish' },
  // round2/verify/c10.ts + c10b.ts
  { text: 'Your chart shows you will die young, around age 45.', expect: OWN_EN, lang: 'en' },
  { text: 'This placement indicates an early death.', expect: OWN_EN, lang: 'en' },
  { text: 'You will become a widow after marriage.', expect: FAMILY_EN, lang: 'en' },
  { text: 'Your husband will die early because of Mangal dosha.', expect: FAMILY_EN, lang: 'en' },
  { text: 'You will have a serious accident in 2027.', expect: 'Take extra care while travelling and driving in 2027.', lang: 'en' },
  { text: 'Your child will suffer from a serious illness.', expect: CHILD_EN, lang: 'en' },
  { text: 'Aapki shaadi 2027 mein pakka hogi.', expect: /^2027 ka samay shaadi ke liye anukool hai/, lang: 'hinglish' },
  { text: 'Aapki maut jaldi hogi.', expect: 'Is samay apni sehat ka khaas dhyan rakhein, bina wajah jokhim na lein aur check-up na chhodein.', lang: 'hinglish' },
  { text: 'You will definitely get married in 2027.', expect: /^2027 is a supportive time for marriage matters — a period of possibility, not a promise/, lang: 'en' },
  { text: 'Your chart indicates a short lifespan and early death.', expect: OWN_EN, lang: 'en' },
  { text: 'Widowhood (vaidhavya) is strongly indicated in your 7th house.', expect: FAMILY_EN, lang: 'en' },
  { text: 'Your spouse is going to die before you.', expect: FAMILY_EN, lang: 'en' },
  { text: 'Aapko 2027 mein durghatna zaroor hogi.', expect: 'Is samay (2027) yatra aur driving mein savdhani rakhein.', lang: 'hinglish' },
  { text: 'Aapke bachche bimar rahenge.', expect: 'Is samay bachche ki routine health care par nazar rakhein; regular check-up karwana achha rahega.', lang: 'hinglish' },
  { text: "You'll lose your husband early.", expect: FAMILY_EN, lang: 'en' },
  { text: 'Your father may pass away in your Saturn Mahadasha.', expect: 'Elders or family members may need more of your time and support during your Saturn Mahadasha — stay close and keep an eye on their health.', lang: 'en' },
  // Hindi (Devanagari)
  { text: 'शादी के बाद पति की मृत्यु का योग है।', expect: 'इस समय परिवार के बड़ों का विशेष ध्यान रखें — उन्हें आपके समय और साथ की आवश्यकता हो सकती है।', lang: 'hi' },
  { text: 'आपकी शादी 2027 में पक्की है।', expect: /^2027 का समय विवाह के लिए अनुकूल है/, lang: 'hi' },
  { text: 'आपको इस साल दुर्घटना होगी।', expect: 'इस समय यात्रा और गाड़ी चलाते समय विशेष सावधानी रखें।', lang: 'hi' },
  { text: 'आपके बच्चे को गंभीर बीमारी होगी।', expect: 'इस समय बच्चे की नियमित स्वास्थ्य देखभाल पर ध्यान रखें; समय-समय पर जाँच करवाना अच्छा रहेगा।', lang: 'hi' },
  { text: 'आपकी अकाल मृत्यु का योग है।', expect: 'इस समय अपनी सेहत का विशेष ध्यान रखें, अनावश्यक जोखिम से बचें और नियमित जाँच न छोड़ें।', lang: 'hi' },
  // window kept
  { text: 'Your Venus Antardasha from August 2005 to October 2006 is a certain marriage time.', expect: /^The window from August 2005 to October 2006 is a supportive time for marriage matters/, lang: 'en' },
  { text: 'Divorce is indicated in your Saturn Mahadasha.', expect: 'Your relationship asks for extra patience and open, honest communication during your Saturn Mahadasha.', lang: 'en' },
];

const SAFE = [
  'Your 7th house is ruled by Venus, which traditionally favours harmony in partnership.',
  "Astrology can't predict death, accidents or illness, and I won't try.",
  'Please take care of your health and see a doctor for anything that worries you.',
  'Your Venus Antardasha from August 2005 to October 2006 carried strong relationship significance.',
  "Saturn's transit through your 8th house is traditionally a time for patience and steady routines.",
  'The 8th house traditionally relates to transformation and shared resources.',
  'Many people marry outside these windows — nothing here is certain.',
  'शनि का गोचर धैर्य और अनुशासन का समय माना जाता है।',
  'Yeh samay rishton mein samajhdari ka hai.',
  'This period is traditionally associated with taking extra care of your energy.',
];

describe('K8: harmful predictions are rephrased into caring caution (founder decision)', () => {
  for (const h of HARMFUL) {
    it(`rephrases: ${h.text}`, () => {
      const out = rephraseHarmfulPredictions(h.text);
      expect(out.rephrased).toHaveLength(1);
      if (typeof h.expect === 'string') expect(out.text).toBe(h.expect); else expect(out.text).toMatch(h.expect);
      expect(out.text).not.toMatch(FORBIDDEN);
      if (h.lang === 'hi') expect(out.text).toMatch(/[\u0900-\u097F]/);
      if (h.lang === 'en') expect(out.text).not.toMatch(/[\u0900-\u097F]|\b(mein|dhyan|rakhein)\b/);
      if (h.lang === 'hinglish') expect(out.text).toMatch(/\b(dhyan|rakhein|samay)\b/);
    });
  }
  for (const s of SAFE) {
    it(`leaves safe text unchanged: ${s}`, () => {
      expect(rephraseHarmfulPredictions(s)).toEqual({ text: s, rephrased: [] });
      expect(findHarmfulPredictions(s)).toEqual([]);
    });
  }
  it('rewrites only the harmful sentence and keeps the rest of the reply', () => {
    const r = rephraseHarmfulPredictions('Your Venus period supports warmth at home. A major accident is indicated in Rahu antardasha. Keep your routines steady.');
    expect(r.text).toBe('Your Venus period supports warmth at home. Take extra care while travelling and driving during your Rahu antardasha. Keep your routines steady.');
  });
  it('the output scanner reports harmful predictions on raw text', () => {
    expect(scanChatResponse('Your spouse is likely to pass away early.')).toContain('harmful prediction: death');
    expect(scanChatResponse('Shaadi pakka hai 2027 mein, aapki.')).toContain('harmful prediction: marriage-certainty');
    expect(scanChatResponse('Your Venus period supports warmth at home.')).toEqual([]);
  });
  it('the chat endpoint rephrases a harmful model reply instead of blocking it', async () => {
    const { facts } = await p9();
    const gen = async () => 'This period carries Venus warmth for the home. Your spouse is likely to pass away early.';
    const out: any = await buildChatReply(facts, [], 'how is my married life this year?', gen);
    expect(out.reply).toContain('This period carries Venus warmth for the home.');
    expect(out.reply).toContain(FAMILY_EN);
    expect(out.reply).not.toMatch(FORBIDDEN);
    expect(out.rephrased).toEqual(['death']);
    expect(out.sanitized).toBe(false);
  });
  it('the system prompt tells the model to express risk as gentle precaution, not to omit it', async () => {
    const { facts } = await p9();
    const sys = buildChatSystemPrompt(facts);
    expect(sys).toMatch(/LIFE, DEATH, ACCIDENTS, ILLNESS, MARRIAGE CERTAINTY/);
    expect(sys).toMatch(/Do NOT omit the risk either/);
    expect(sys).toContain(OWN_EN);
    expect(sys).toContain(FAMILY_EN);
    expect(sys).toContain(TRAVEL_EN);
  });
});

// ── K6 ───────────────────────────────────────────────────────────────────────
describe('K6: past questions may cite every adult-era past window', () => {
  it('P9: the Ketu–Venus window Aug 2005–Oct 2006 (marriage June 2006) is available', async () => {
    const { facts } = await p9();
    const m = facts.timing.categories.find(c => c.key === 'marriage')!;
    // Before the fix only the 3 most recent were kept — this window is the 4th.
    expect(m.past.map(w => w.range)).not.toContain('August 2005 to October 2006');
    expect(m.allPast!.map(w => w.range)).toContain('August 2005 to October 2006');
    // Childhood windows (ending before 18) are not offered for "when did I marry".
    for (const w of m.allPast!) expect(new Date(w.end).getTime()).toBeGreaterThan(new Date('1996-05-13').getTime());
  });
  it('the chat accepts the classical match for "When did I get married?" (no longer rejected by the date guard)', async () => {
    const { facts } = await p9();
    let calls = 0;
    const gen = async () => { calls++; return 'Looking back, your Venus Antardasha within the Ketu period, from August 2005 to October 2006, is the classical match for a marriage.'; };
    const out: any = await buildChatReply(facts, [], 'When did I get married?', gen);
    expect(calls).toBe(1);
    expect(out.timingCorrected).toBeUndefined();
    expect(out.reply).toContain('August 2005 to October 2006');
  });
  it('the prompt lists the older past window for a past question, but not for a future one', async () => {
    const { facts } = await p9();
    const ctx = resolveMarriageContext('When did I get married?');
    expect(buildChatSystemPrompt(facts, undefined, ctx, { pastQuestion: true })).toContain('August 2005 to October 2006');
    expect(buildChatSystemPrompt(facts, undefined, resolveMarriageContext('when will I get married'))).not.toContain('August 2005 to October 2006');
  });
  it('the deterministic past-tense fallback includes the Ketu–Venus window', async () => {
    const { facts } = await p9();
    const r = deterministicTimingReply(facts.timing, 'marriage', resolveMarriageContext('When did I get married?'))!;
    expect(r).toContain('August 2005 to October 2006');
  });
  it('future timing stays a window: an exact day is rejected, today and user-typed days are allowed', () => {
    expect(findExactDays('Your window opens on 3 April 2027.')).toEqual(['3/4']);
    expect(findExactDays('From March 2034 to January 2035.')).toEqual([]);
    expect(findExactDays('this may bring 5 may themes')).toEqual([]);
    expect(disallowedExactDays('Your marriage comes on April 3rd, 2034.', ['Saturday, 17 October 2026'])).toEqual(['3/4']);
    expect(disallowedExactDays('As of today, 17 October 2026, Saturn is in Meena.', ['Saturday, 17 October 2026'])).toEqual([]);
    expect(disallowedExactDays('You married on 12 June 2006.', ['I married on 12 June 2006 — does it fit?'])).toEqual([]);
  });
  it('the chat retries a reply that gives an exact future day', async () => {
    const { facts } = await p9();
    const replies = [
      'Your next relationship window opens on 3 April 2034.',
      'A supportive period for you sits in your current Venus Mahadasha.',
    ];
    let i = 0;
    const out: any = await buildChatReply(facts, [], 'what about my relationship energy?', async () => replies[Math.min(i++, 1)]);
    expect(i).toBe(2);
    expect(out.reply).toBe(replies[1]);
  });
});

// ── K7 ───────────────────────────────────────────────────────────────────────
describe('K7: the chat knows today, age, running Dasha and current transits', () => {
  it('builds the now-context from the engine (signs match Swiss Ephemeris)', async () => {
    const { chart, ageYears } = await p9();
    const c = buildNowContext(chart, NOW, { ageYears, userTimeZone: 'Asia/Kolkata', maritalStatus: 'married' });
    expect(c.todayLabel).toBe('Saturday, 17 October 2026');
    expect(c.timeZoneSource).toBe('user');
    expect(c.ageYears).toBe(48);
    const sign = (p: string) => c.transits.find(t => t.planet === p)!.sign;
    expect(sign('Saturn')).toBe('Meena');
    expect(sign('Jupiter')).toBe('Karka');
    expect(sign('Rahu')).toBe('Kumbha');
    expect(sign('Ketu')).toBe('Simha');
    expect(c.currentDasha?.maha).toBe(chart.currentDasha!.mahadasha);
    expect(c.currentDasha?.antar).toBe(chart.currentDasha!.antardasha);
    const moonIdx = chart.planets.find(p => p.name === 'Moon')!.signIndex - 1;
    const sat = c.transits.find(t => t.planet === 'Saturn')!;
    expect(sat.houseFromMoon).toBe(((11 - moonIdx + 12) % 12) + 1); // Meena = index 11
    expect(c.validMonths).toContain('October 2026');
  });
  it('uses the user time zone for "today" (a date that differs from UTC)', async () => {
    const { chart } = await p9();
    const lateUtc = new Date('2026-10-17T20:00:00Z'); // already 18 Oct in India
    expect(buildNowContext(chart, lateUtc, { userTimeZone: 'Asia/Kolkata' }).todayLabel).toBe('Sunday, 18 October 2026');
    expect(buildNowContext(chart, lateUtc, { userTimeZone: 'America/New_York' }).todayLabel).toBe('Saturday, 17 October 2026');
    const fallback = buildNowContext(chart, lateUtc, { userTimeZone: 'Not/AZone', birthTimeZone: 'Asia/Kolkata' });
    expect(fallback.timeZoneSource).toBe('birthplace');
  });
  it('the system prompt carries the block', async () => {
    const { chart, facts, ageYears } = await p9();
    const now = buildNowContext(chart, NOW, { ageYears, userTimeZone: 'Asia/Kolkata' });
    const sys = buildChatSystemPrompt(facts, undefined, undefined, { now });
    expect(sys).toContain("Today's date: Saturday, 17 October 2026");
    expect(sys).toContain('Age: 48 years old');
    expect(sys).toMatch(/Saturn in Meena: \d+(st|nd|rd|th) house from the Moon sign/);
    expect(sys).toContain('Marital status: not stated');
    expect(nowContextBlock(now)).toMatch(/Jupiter in Karka/);
  });
});

// ── Marital status ───────────────────────────────────────────────────────────
describe('Marital status (optional profile field)', () => {
  it('profile: optional, validated, kept by merge, default "not said"', () => {
    const base = { dob: '1978-05-13' };
    expect(isValidProfile({ ...base, maritalStatus: 'married' })).toBe(true);
    expect(isValidProfile({ ...base, maritalStatus: 'widowed' })).toBe(false);
    expect(maritalStatusOf(base)).toBe('not-said');
    expect(maritalStatusOf(null)).toBe('not-said');
    expect(mergeProfile({ ...base, maritalStatus: 'married' }, { time: '19:30' }).maritalStatus).toBe('married');
    expect(normaliseMaritalStatus('anything')).toBe('not-said');
  });
  it('reading prompt: married → partnership wording, never a marriage window', async () => {
    const { chart, ageYears } = await p9();
    const married = buildReadingUserPrompt(extractReadingFacts(chart, NOW, { ageYears, maritalStatus: 'married' }));
    expect(married).toMatch(/Partnership \(this person is ALREADY MARRIED/);
    expect(married).not.toMatch(/- Marriage \(driven by/);
    expect(married).toMatch(/do NOT write any forward "marriage window"/);
    const single = buildReadingUserPrompt(extractReadingFacts(chart, NOW, { ageYears, maritalStatus: 'single' }));
    expect(single).toMatch(/- Marriage \(driven by/);
  });
  it('chat: married profile → a "when will I get married" question is answered past-only', async () => {
    const { chart, facts, ageYears } = await p9();
    const now = buildNowContext(chart, NOW, { ageYears, maritalStatus: 'married' });
    const m = facts.timing.categories.find(c => c.key === 'marriage')!;
    const future = m.upcoming.find(w => w.status === 'upcoming')!;
    const gen = async () => `Your next marriage window is ${future.range}.`;
    const out: any = await buildChatReply(facts, [], 'when will I get married?', gen, undefined, now);
    expect(out.reply).not.toContain(future.range.split(' to ')[0]);
    expect(out.timingCorrected).toBe(true);
  });
});
