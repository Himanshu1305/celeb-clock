/**
 * Batch 7 (SEO) — one page per person.
 *
 * The celebrity dataset had the same person on two URLs (e.g. /celebrity/virat-kohli
 * and /celebrity/virat-kohli-1988, /celebrity/apj-abdul-kalam and
 * /celebrity/a-p-j-abdul-kalam, /celebrity/bhimrao-ambedkar and
 * /celebrity/bhimrao-ramji-ambedkar). This module is the ONE dedupe rule, used by
 *   - src/data/indianCelebrities.ts      (static list → every generateAllSlugs() map)
 *   - scripts/export-celebrities.ts      (nightly celebrities.json export)
 *   - scripts/gen-celebrity-slugs.mts    (prerender route + title list)
 * so a duplicate cannot come back through the nightly export.
 *
 * Two records are the same person when
 *   (a) their names are equal after normalisation (case, accents, dots, spaces and
 *       hyphens ignored: "A. P. J. Abdul Kalam" = "APJ Abdul Kalam", "Rekhā" = "Rekha")
 *       AND their birth dates are equal; or
 *   (b) the pair is in CELEBRITY_ALIASES below — a short, hand-checked list of
 *       different spellings of the same person with the same birth date.
 * The first record (array order; the static list comes first) keeps its slug; the
 * other's useful fields (DB id, sitelinks, occupation, a real death date) are merged
 * in, and its slug is retired with a 301 (src/data/celebritySlugRedirects.json →
 * src/lib/seo/duplicateRedirects.ts).
 */

/** Lower-case, strip accents and every non-alphanumeric character. */
export function normalizeCelebName(name: string): string {
  return String(name || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Different spellings of the SAME person, same birth date: retired slug → kept slug.
 * Conservative: each pair was checked by birth date (and death date where dead),
 * occupation, and the celebrity_sitelinks Wikidata id of the DB row (read-only query,
 * 25 Oct 2026). Same-date pairs that are DIFFERENT people (e.g. Sonu Nigam / Sonu
 * Sood, both born 1973-07-30) are deliberately absent.
 */
export const CELEBRITY_ALIASES: Readonly<Record<string, string>> = {
  'bhimrao-ramji-ambedkar': 'bhimrao-ambedkar',                 // Q231690, 1891-04-14 – 1956-12-06
  'abul-kalam-azad': 'maulana-abul-kalam-azad',                 // Q196617, 1888-11-11 – 1958-02-22
  'a-c-bhaktivedanta-swami-prabhupada': 'srila-prabhupada',     // Q234898, 1896-09-01 – 1977-11-14
  'aurobindo-ghosh': 'sri-aurobindo',                           // Q192207, 1872-08-15 – 1950-12-05
  'rajneesh': 'osho-rajneesh',                                  // Q148285, 1931-12-11 – 1990-01-19
  'jiddu-krishnamurti': 'j-krishnamurti',                       // Q179266, 1895-05-12 – 1986-02-17
  'sivananda-saraswati': 'swami-sivananda',                     // Q458855, 1887-09-08 – 1963-07-14
  'sadhguru': 'sadhguru-jaggi-vasudev',                         // Q793985, 1957-09-03
  'gurudev-sri-sri-ravi-shankar': 'sri-sri-ravi-shankar',       // Q468374, 1956-05-13
  'ramdev': 'baba-ramdev',                                      // Q286658, 1965-12-25
  'homi-jehangir-bhabha': 'homi-bhabha',                        // Q325611, 1909-10-30 – 1966-01-24
  'satyendra-nath-bose': 'satyen-bose',                         // Q45789, 1894-01-01 – 1974-02-04
  'abhinav': 'abhinav-bindra',                                  // Q320610 (sport shooter), 1982-09-28
  'n-t-rama-rao-jr': 'jr-ntr',                                  // Q3498996, 1983-05-20
  'viswanathan-anand': 'vishwanathan-anand',                    // Q45747 (chess), 1969-12-11
  'yash-raj-chopra': 'yash-chopra',                             // 1932-09-27 – 2012-10-21, director
  'ameesha-patel': 'amisha-patel',                              // Q263819, 1975-06-09
  'rani-mukherjee': 'rani-mukerji',                             // Q485557, 1978-03-21
  'manoj-bajpai': 'manoj-bajpayee',                             // Q158533, 1969-04-23
  'gukesh-d': 'd-gukesh',                                       // Q56026072 (chess), 2006-05-29
  'saikhom-mirabai-chanu': 'mirabai-chanu',                     // Q17415291 (weightlifter), 1994-08-08
  'praggnanandhaa': 'r-praggnanandhaa',                         // Q26703041 (chess), 2005-08-10
  'sachin-dev-burman': 'sd-burman',                             // Q2723913, 1906-10-01 – 1975-10-31
  'lal-krishna-advani': 'lk-advani',                            // Q468324, 1927-11-08
  'sunil-shetty': 'suniel-shetty',                              // Q983043, 1961-08-11
  'rajendra-prasad': 'dr-rajendra-prasad',                      // Q197736, 1884-12-03 – 1963-02-28
  'jayant-vishnu-narlikar': 'jayant-narlikar',                  // Q179201, 1938-07-19
  'vengalil-krishnan-krishna-menon': 'vk-krishna-menon',        // Q3595860, 1896-05-03 – 1974-10-06
  'jayaram-jayalalithaa': 'jayalalithaa',                       // Q465018, 1948-02-24 – 2016-12-05
  'r-madhavan': 'madhavan',                                     // Q729982, 1970-06-01
  'keerthy-suresh': 'keerti-suresh',                            // Q17403476, 1992-10-17
  'dr-puneeth-rajkumar': 'puneeth-rajkumar',                    // Q3351697, 1975-03-17 – 2021-10-29
  'baldev-raj-chopra': 'br-chopra',                             // Q804792, 1914-04-22 – 2008-11-05
  's-p-balasubrahmanyam': 'sp-balasubrahmanyam',                // Q2049688, 1946-06-04 – 2020-09-25 (read-only query 29 Oct 2026)
};

type Rec = Record<string, unknown>;

const isPlaceholderDeath = (d: unknown) => typeof d === 'string' && /^\d{4}-01-01/.test(d);
const empty = (v: unknown) => v === null || v === undefined || v === '';

/** Merge `other` into `kept` (kept wins; fills gaps; prefers a real over a YYYY-01-01 death date). */
export function mergeCelebrityRecords<T extends Rec>(kept: T, other: Rec): T {
  const out: Rec = { ...kept };
  for (const k of ['id', 'occupation', 'death_year', 'nationality_code', 'birth_month_day', 'birth_year']) {
    if (empty(out[k]) && !empty(other[k])) out[k] = other[k];
  }
  if (empty(out.known_for) && !empty(other.known_for)) out.known_for = other.known_for;
  const sk = Number(out.sitelinks ?? 0), so = Number(other.sitelinks ?? 0);
  if (so > sk) out.sitelinks = other.sitelinks;
  const dk = out.death_date, dOther = other.death_date;
  if (!empty(dOther)) {
    const sameYear = empty(dk) || String(dk).slice(0, 4) === String(dOther).slice(0, 4);
    if (sameYear && (empty(dk) || (isPlaceholderDeath(dk) && !isPlaceholderDeath(dOther)))) out.death_date = dOther;
  }
  return out as T;
}

export interface DedupeResult<T> {
  list: T[];
  /** retired slug → kept slug (only records that HAD a slug). */
  retired: Record<string, string>;
  /** human-readable log of each merge */
  merges: Array<{ kept: string; retired: string; reason: 'same-name-and-date' | 'alias' }>;
}

/**
 * Collapse same-person duplicates. `slugOf` gives a record's slug (or undefined for
 * records that are not yet slugged, e.g. the static list before slug assignment).
 */
export function dedupeCelebrities<T extends Rec>(
  records: readonly T[],
  slugOf: (r: T) => string | undefined = r => (r.slug ? String(r.slug) : undefined),
): DedupeResult<T> {
  const list: T[] = [];
  const byKey = new Map<string, number>();
  const bySlug = new Map<string, number>();
  const retired: Record<string, string> = {};
  const merges: DedupeResult<T>['merges'] = [];

  for (const r of records) {
    const bd = r.birth_date ? String(r.birth_date).slice(0, 10) : '';
    const key = bd ? `${normalizeCelebName(String(r.name || ''))}|${bd}` : '';
    const slug = slugOf(r);
    let idx: number | undefined;
    let reason: 'same-name-and-date' | 'alias' = 'same-name-and-date';
    if (key && byKey.has(key)) idx = byKey.get(key);
    else if (slug && CELEBRITY_ALIASES[slug] && bySlug.has(CELEBRITY_ALIASES[slug])) {
      const j = bySlug.get(CELEBRITY_ALIASES[slug])!;
      // Alias only when the birth dates really agree.
      if (String(list[j].birth_date || '').slice(0, 10) === bd) { idx = j; reason = 'alias'; }
    }
    if (idx !== undefined) {
      list[idx] = mergeCelebrityRecords(list[idx], r);
      const keptSlug = slugOf(list[idx]);
      if (slug && keptSlug && slug !== keptSlug) {
        retired[slug] = keptSlug;
        merges.push({ kept: keptSlug, retired: slug, reason });
      }
      continue;
    }
    const i = list.push(r) - 1;
    if (key) byKey.set(key, i);
    if (slug) bySlug.set(slug, i);
  }

  // Alias source seen BEFORE its target: merge it into the target now.
  for (const [src, dst] of Object.entries(CELEBRITY_ALIASES)) {
    const si = list.findIndex(r => slugOf(r) === src);
    const di = list.findIndex(r => slugOf(r) === dst);
    if (si < 0 || di < 0) continue;
    if (String(list[si].birth_date || '').slice(0, 10) !== String(list[di].birth_date || '').slice(0, 10)) continue;
    list[di] = mergeCelebrityRecords(list[di], list[si]);
    list.splice(si, 1);
    retired[src] = dst;
    merges.push({ kept: dst, retired: src, reason: 'alias' });
  }
  return { list, retired, merges };
}

/**
 * Merge newly retired slugs into the persisted redirect map (append-only, so a URL
 * retired once keeps redirecting). Chains are collapsed (a → b, b → c ⇒ a → c), and an
 * entry whose source is a live slug again is dropped (a live page must never 301).
 * Keys are sorted so the committed file diffs cleanly.
 */
export function recordRetiredSlugs(
  previous: Record<string, string>,
  retired: Record<string, string>,
  liveSlugs: ReadonlySet<string>,
): Record<string, string> {
  const all: Record<string, string> = { ...previous, ...retired };
  const resolve = (s: string): string => {
    const seen = new Set<string>();
    while (all[s] && !seen.has(s)) { seen.add(s); s = all[s]; }
    return s;
  };
  const out: Record<string, string> = {};
  for (const k of Object.keys(all).sort()) {
    if (liveSlugs.has(k)) continue;
    const target = resolve(k);
    if (target !== k && liveSlugs.has(target)) out[k] = target;
  }
  return out;
}
