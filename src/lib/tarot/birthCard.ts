/**
 * Tarot birth cards — audit N7. The ONE shared sitewide "tarot card by date of birth" method.
 *
 * Method: Mary K. Greer's birth cards (Tarot Constellations / "personality and soul" cards),
 * the method used by the common public calculators:
 *   1. Add month + day + full year as plain numbers (e.g. 31 Aug 1996 → 8 + 31 + 1996 = 2035).
 *   2. Add the digits of that total, and keep adding digits while the result is above 22
 *      (2035 → 2+0+3+5 = 10).
 *   3. That number (1–22) is the first birth card. 22 is The Fool (card 0).
 *   4. Reduce it to a single digit for the paired card (10 → 1, The Magician). A 19 gives a
 *      chain of three (19 → 10 → 1); 22 pairs with 4 (The Emperor). A single-digit result
 *      is one card that serves as both.
 *
 * Sources checked (Oct 2026): biddytarot.com "Tarot Birth Cards" (Method 3, Mary Greer),
 * angelorum.co "How to calculate your personality and soul cards", tools.devcomma.com
 * Birth Arcana calculator ("Personality & Soul" mode, 22 shown as 22/0 + Emperor).
 */

export interface TarotBirthCards {
  /** month + day + year */
  total: number;
  /** Reduction chain shown to the user, e.g. [2035, 10, 1] */
  steps: number[];
  /** Major Arcana card numbers (0–21), birth card first, e.g. [10, 1], [19, 10, 1], [0, 4], [9]. */
  cards: number[];
}

function digitSum(n: number): number {
  return String(Math.abs(Math.trunc(n)))
    .split('')
    .reduce((s, d) => s + Number(d), 0);
}

export function tarotBirthCards(day: number, month: number, year: number): TarotBirthCards {
  const total = month + day + year;
  const steps: number[] = [total];
  let n = digitSum(total);
  steps.push(n);
  while (n > 22) {
    n = digitSum(n);
    steps.push(n);
  }

  const cards: number[] = [];
  if (n === 22) {
    // 22 = The Fool (card 0); its digits give The Emperor (4).
    cards.push(0, 4);
    steps.push(4);
  } else {
    cards.push(n);
    let m = n;
    while (m > 9) {
      m = digitSum(m);
      cards.push(m);
      steps.push(m);
    }
  }
  return { total, steps, cards };
}

/** Convenience: from an ISO 'YYYY-MM-DD' date. Returns null for an unparseable date. */
export function tarotBirthCardsFromIso(iso: string | null | undefined): TarotBirthCards | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return tarotBirthCards(day, month, year);
}

/** Human-readable working, e.g. "8 + 31 + 1996 = 2035 → 2+0+3+5 = 10 → 1+0 = 1". */
export function describeBirthCardWorking(day: number, month: number, year: number): string {
  const r = tarotBirthCards(day, month, year);
  const parts = [`${month} + ${day} + ${year} = ${r.total}`];
  for (let i = 1; i < r.steps.length; i++) {
    const prev = r.steps[i - 1];
    const cur = r.steps[i];
    if (prev === 22 && cur === 4) {
      parts.push('22 = The Fool (0), paired with 2+2 = 4');
      continue;
    }
    parts.push(`${String(prev).split('').join('+')} = ${cur}`);
  }
  return parts.join(' → ');
}
