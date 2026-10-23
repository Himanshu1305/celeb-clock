/**
 * Starting syllables (aksharas) per Nakshatra pada for baby-name selection —
 * the ONE table used site-wide (baby names, Child Kundli, /nakshatra pages).
 *
 * Reference (N5, Oct 2026): the standard 108-pada Avakahada table as published by
 * Drik Panchang ("Hindu Name Initials — 108 Pada Swars based on 27 Nakshatras",
 * drikpanchang.com/swar-siddhanta/nakshatra/…), cross-checked against
 * onlinejyotish.com/articles/rashi-nakshatra-with-name.php (which gives Devanagari).
 * Drik Panchang pages spot-checked by URL/title: Ardra P3 "Ing", Ardra P4 "Chha",
 * Shravana P1 "Khee" / P3 "Khe" / P4 "Kho", Uttara Bhadrapada P3 "Jha" / P4 "Yna",
 * Purva Ashadha P2 "Dhaa" / P3 "Phaa" / P4 "Dha", Uttara Ashadha P1 "Bhe" / P3 "Jaa" /
 * P4 "Jee", Hasta P3 "Na" / P4 "Tha", Mula P3 "Bhaa", Krittika P2 "Ee", Rohini P4 "Vu",
 * Swati P4 "Taa", Mrigashira P4 "Kee", Pushya P4 "Daa".
 *
 * Only ONE syllable applies to a given baby: the one for the pada the Moon occupied.
 * `hi` is the Devanagari syllable — it is what names are matched against, because the
 * Roman spelling is ambiguous (e.g. "Da" is डा in Pushya but दा in Purva Bhadrapada).
 */
export interface PadaAkshara { en: string; hi: string }

const P = (en: string, hi: string): PadaAkshara => ({ en, hi });

export const NAKSHATRA_PADA_AKSHARAS: Record<string, [PadaAkshara, PadaAkshara, PadaAkshara, PadaAkshara]> = {
  'Ashwini':           [P('Chu', 'चू'), P('Che', 'चे'), P('Cho', 'चो'), P('La', 'ला')],
  'Bharani':           [P('Li', 'ली'), P('Lu', 'लू'), P('Le', 'ले'), P('Lo', 'लो')],
  'Krittika':          [P('A', 'अ'), P('I', 'ई'), P('U', 'ऊ'), P('E', 'ए')],
  'Rohini':            [P('O', 'ओ'), P('Va', 'वा'), P('Vi', 'वी'), P('Vu', 'वू')],
  'Mrigashira':        [P('Ve', 'वे'), P('Vo', 'वो'), P('Ka', 'का'), P('Ki', 'की')],
  'Ardra':             [P('Ku', 'कू'), P('Gha', 'घ'), P('Ing', 'ङ'), P('Chha', 'छ')],
  'Punarvasu':         [P('Ke', 'के'), P('Ko', 'को'), P('Ha', 'हा'), P('Hi', 'ही')],
  'Pushya':            [P('Hu', 'हू'), P('He', 'हे'), P('Ho', 'हो'), P('Da', 'डा')],
  'Ashlesha':          [P('Di', 'डी'), P('Du', 'डू'), P('De', 'डे'), P('Do', 'डो')],
  'Magha':             [P('Ma', 'मा'), P('Mi', 'मी'), P('Mu', 'मू'), P('Me', 'मे')],
  'Purva Phalguni':    [P('Mo', 'मो'), P('Ta', 'टा'), P('Ti', 'टी'), P('Tu', 'टू')],
  'Uttara Phalguni':   [P('Te', 'टे'), P('To', 'टो'), P('Pa', 'पा'), P('Pi', 'पी')],
  'Hasta':             [P('Pu', 'पू'), P('Sha', 'ष'), P('Na', 'ण'), P('Tha', 'ठ')],
  'Chitra':            [P('Pe', 'पे'), P('Po', 'पो'), P('Ra', 'रा'), P('Ri', 'री')],
  'Swati':             [P('Ru', 'रू'), P('Re', 'रे'), P('Ro', 'रो'), P('Ta', 'ता')],
  'Vishakha':          [P('Ti', 'ती'), P('Tu', 'तू'), P('Te', 'ते'), P('To', 'तो')],
  'Anuradha':          [P('Na', 'ना'), P('Ni', 'नी'), P('Nu', 'नू'), P('Ne', 'ने')],
  'Jyeshtha':          [P('No', 'नो'), P('Ya', 'या'), P('Yi', 'यी'), P('Yu', 'यू')],
  'Mula':              [P('Ye', 'ये'), P('Yo', 'यो'), P('Bha', 'भा'), P('Bhi', 'भी')],
  'Purva Ashadha':     [P('Bhu', 'भू'), P('Dha', 'धा'), P('Pha', 'फा'), P('Dha', 'ढा')],
  'Uttara Ashadha':    [P('Bhe', 'भे'), P('Bho', 'भो'), P('Ja', 'जा'), P('Ji', 'जी')],
  'Shravana':          [P('Khi', 'खी'), P('Khu', 'खू'), P('Khe', 'खे'), P('Kho', 'खो')],
  'Dhanishtha':        [P('Ga', 'गा'), P('Gi', 'गी'), P('Gu', 'गू'), P('Ge', 'गे')],
  'Shatabhisha':       [P('Go', 'गो'), P('Sa', 'सा'), P('Si', 'सी'), P('Su', 'सू')],
  'Purva Bhadrapada':  [P('Se', 'से'), P('So', 'सो'), P('Da', 'दा'), P('Di', 'दी')],
  'Uttara Bhadrapada': [P('Du', 'दू'), P('Tha', 'थ'), P('Jha', 'झ'), P('Yna', 'ञ')],
  'Revati':            [P('De', 'दे'), P('Do', 'दो'), P('Cha', 'चा'), P('Chi', 'ची')],
};

/** Roman syllables per Nakshatra, pada 1..4 (derived from the table above). */
export const NAKSHATRA_AKSHARAS: Record<string, string[]> = Object.fromEntries(
  Object.entries(NAKSHATRA_PADA_AKSHARAS).map(([n, ps]) => [n, ps.map(p => p.en)]),
);

export const NAKSHATRA_LIST = Object.keys(NAKSHATRA_PADA_AKSHARAS);

/** The single naming syllable for a Nakshatra + pada (1–4), or null if unknown. */
export function aksharaForPada(nakshatra: string, pada: number): PadaAkshara | null {
  const row = NAKSHATRA_PADA_AKSHARAS[nakshatra];
  if (!row || !Number.isInteger(pada) || pada < 1 || pada > 4) return null;
  return row[pada - 1];
}
