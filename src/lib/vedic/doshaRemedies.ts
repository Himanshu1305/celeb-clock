/**
 * Part AI — structured, impact-first descriptions and calm (non-fear-based)
 * remedies for the three major doshas the engine detects. This turns the
 * previously LLM-only "Doshas" prose into a deterministic, labelled section so
 * Kaal Sarp gets the same first-class treatment as Manglik, and every detected
 * pattern carries a free, honest remedy list (never "pay to remove a curse").
 *
 * Tone rules (enforced in the copy below): impact stated first in plain
 * language, then the classical reasoning, then optional guidance. No urgency,
 * no fear, no guaranteed outcomes — remedies are framed as traditional customs
 * and constructive habits, all free.
 */

export interface DoshaDetail {
  /** Term id in VEDIC_TERMS for the inline tooltip. */
  termId: string;
  /** Short label shown as the section heading. */
  label: string;
  /** Plain-language impact FIRST (what it actually means day-to-day). */
  impact: string;
  /** Classical reasoning SECOND. */
  why: string;
  /** Free, calm remedies THIRD — traditional customs and constructive habits. */
  remedies: string[];
}

export const MANGAL_DETAIL: DoshaDetail = {
  termId: 'manglik',
  label: 'Mangal Dosha (Manglik)',
  impact:
    'This mainly matters for marriage timing and matching — it tends to add intensity and impatience to close partnerships, especially early on. It is not a defect in you and does not doom a relationship.',
  why:
    'It is flagged when Mars sits in certain houses from the Ascendant, Moon or Venus. Classically Mars brings drive and heat, which can show up as friction if two charts are mismatched on this point — which is exactly why it is checked during compatibility, and why two Manglik partners are traditionally considered well-matched.',
  remedies: [
    'Channel Mars constructively — regular physical activity, sport or disciplined work genuinely takes the edge off its restlessness.',
    'In matching, the simplest classical remedy is pairing with a partner who shares the same placement, which is said to cancel the effect.',
    'Some recite the Hanuman Chalisa or observe Tuesdays with a lighter, calmer routine — offered as tradition, not a requirement.',
    'Practise patience in the first years of a partnership; the pattern is about heat and haste, and slowing down directly addresses it.',
  ],
};

export const KAALSARP_DETAIL: DoshaDetail = {
  termId: 'kaalsarp',
  label: 'Kaal Sarp Dosha',
  impact:
    'This is often described as things feeling delayed or hard-won before they finally break open — effort now, reward later, rather than any kind of danger. Its reputation is far scarier than its actual meaning.',
  why:
    'It is flagged when all seven classical planets fall on one side of the Rahu–Ketu axis. Traditionally this is read as karmic focus being funnelled through that axis, which can feel like extra effort is needed before momentum arrives. A partial version (one planet outside the axis) is milder still.',
  remedies: [
    'Keep going through slow patches — the classical reading is delay, not denial, so persistence is the main "remedy".',
    'Charitable giving and service, especially on Saturdays, are the customs most associated with easing it.',
    'Some visit a Rahu–Ketu or Nagaraja shrine, or recite the Maha Mrityunjaya mantra; take or leave this as suits your beliefs.',
    'Beware anyone charging a large fee to "remove" Kaal Sarp with urgency — that is exploitation of the fear, not a genuine tradition.',
  ],
};

export const SADESATI_DETAIL: DoshaDetail = {
  termId: 'sadeSati',
  label: 'Sade Sati (Saturn)',
  impact:
    'This is a roughly 7.5-year Saturn season that asks for patience and steady effort — many people look back on it as the period that built their strongest foundations, not a time of misfortune.',
  why:
    "It runs while Saturn transits the signs just before, on, and just after your Moon sign. Saturn's themes are discipline, responsibility and long-term reward, so the period tends to consolidate rather than dramatise.",
  remedies: [
    'Lean into Saturn\'s own themes — routine, honest work and finishing what you start; this is the remedy that actually matches the period.',
    'Service to elders and those in need, traditionally on Saturdays, is the most-cited custom.',
    'A dedicated Sade Sati tool with your real dates lives at /sade-sati if you want the full picture.',
  ],
};

/** Return the detail blocks for whichever doshas are actually present. */
export function activeDoshaDetails(doshas: {
  mangal: { present: boolean };
  kaalSarp: { present: boolean; isPartial: boolean };
  sadeSati: { active: boolean };
}): DoshaDetail[] {
  const out: DoshaDetail[] = [];
  if (doshas.mangal?.present) out.push(MANGAL_DETAIL);
  if (doshas.kaalSarp?.present) {
    out.push(
      doshas.kaalSarp.isPartial
        ? { ...KAALSARP_DETAIL, label: 'Kaal Sarp Dosha (partial)' }
        : KAALSARP_DETAIL,
    );
  }
  if (doshas.sadeSati?.active) out.push(SADESATI_DETAIL);
  return out;
}
