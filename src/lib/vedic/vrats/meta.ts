/**
 * Batch 10 — vrat katha + puja vidhi pages: slugs, names, paths and the festival → vrat
 * matcher. Dependency-free (the Cloudflare Worker imports it through the daily registry
 * and the 404 guard), so no engine or content imports here.
 */

export const VRAT_SLUGS = [
  'ekadashi', 'satyanarayan-katha', 'pradosh-vrat', 'sankashti-chaturthi', 'karwa-chauth',
  'somvar-vrat', 'mangalvar-vrat', 'navratri', 'mahashivratri', 'janmashtami',
] as const;
export type VratSlug = typeof VRAT_SLUGS[number];
export const VRAT_SLUG_SET: ReadonlySet<string> = new Set(VRAT_SLUGS);

/** Daily-page slug of the hub (/vrat, /hi/vrat). */
export const VRAT_INDEX_SLUG = 'index';
export const VRAT_PAGE_SLUGS: readonly string[] = [VRAT_INDEX_SLUG, ...VRAT_SLUGS];

export const VRAT_NAMES: Record<VratSlug, { en: string; hi: string; deityEn: string; deityHi: string }> = {
  'ekadashi': { en: 'Ekadashi', hi: 'एकादशी', deityEn: 'Vishnu', deityHi: 'भगवान विष्णु' },
  'satyanarayan-katha': { en: 'Satyanarayan Katha (Purnima)', hi: 'सत्यनारायण कथा (पूर्णिमा)', deityEn: 'Satyanarayana (Vishnu)', deityHi: 'भगवान सत्यनारायण (विष्णु)' },
  'pradosh-vrat': { en: 'Pradosh Vrat', hi: 'प्रदोष व्रत', deityEn: 'Shiva', deityHi: 'भगवान शिव' },
  'sankashti-chaturthi': { en: 'Sankashti Chaturthi', hi: 'संकष्टी चतुर्थी', deityEn: 'Ganesha', deityHi: 'भगवान गणेश' },
  'karwa-chauth': { en: 'Karwa Chauth', hi: 'करवा चौथ', deityEn: 'Parvati (Gauri), Shiva, Ganesha and the Moon', deityHi: 'माता पार्वती (गौरी), शिव, गणेश और चंद्रमा' },
  'somvar-vrat': { en: 'Somvar (Monday) Vrat', hi: 'सोमवार व्रत', deityEn: 'Shiva', deityHi: 'भगवान शिव' },
  'mangalvar-vrat': { en: 'Mangalvar (Tuesday) Hanuman Vrat', hi: 'मंगलवार हनुमान व्रत', deityEn: 'Hanuman', deityHi: 'हनुमान जी' },
  'navratri': { en: 'Navratri', hi: 'नवरात्रि', deityEn: 'Durga (the nine forms)', deityHi: 'माँ दुर्गा (नौ रूप)' },
  'mahashivratri': { en: 'Mahashivratri', hi: 'महाशिवरात्रि', deityEn: 'Shiva', deityHi: 'भगवान शिव' },
  'janmashtami': { en: 'Janmashtami', hi: 'जन्माष्टमी', deityEn: 'Krishna', deityHi: 'भगवान श्रीकृष्ण' },
};

export const vratPath = (slug: string, lang: 'en' | 'hi' = 'en'): string =>
  slug === VRAT_INDEX_SLUG ? (lang === 'hi' ? '/hi/vrat' : '/vrat') : (lang === 'hi' ? `/hi/vrat/${slug}` : `/vrat/${slug}`);

/** Static (undated) title / description / H1 — mirrored by scripts/prerender-titles.mjs. */
export function vratMeta(slug: string, lang: 'en' | 'hi'): { title: string; description: string; h1: string } {
  if (slug === VRAT_INDEX_SLUG) {
    return lang === 'hi'
      ? { title: 'व्रत कथा और पूजा विधि — 10 प्रमुख व्रत, अगली तिथि सहित | BornClock', description: 'एकादशी, सत्यनारायण, प्रदोष, संकष्टी, करवा चौथ, सोमवार, मंगलवार, नवरात्रि, महाशिवरात्रि और जन्माष्टमी — स्रोत-सहित कथा, सरल पूजा विधि और हमारे पंचांग से अगली तिथि।', h1: 'व्रत कथा और पूजा विधि' }
      : { title: 'Vrat Katha & Puja Vidhi — 10 Hindu Fasts with Next Dates | BornClock', description: 'Ekadashi, Satyanarayan, Pradosh, Sankashti, Karwa Chauth, Somvar, Mangalvar, Navratri, Mahashivratri and Janmashtami — sourced katha, a simple puja vidhi and the next date from our Panchang.', h1: 'Vrat katha & puja vidhi' };
  }
  const n = VRAT_NAMES[slug as VratSlug];
  if (!n) throw new Error(`unknown vrat slug "${slug}"`);
  return lang === 'hi'
    ? { title: `${n.hi} — व्रत कथा, पूजा विधि और अगली तिथि | BornClock`, description: `${n.hi}: स्रोत-सहित व्रत कथा सरल भाषा में, पूजा सामग्री और विधि के आसान चरण, क्षेत्रीय परंपराएँ, और हमारे पंचांग से अगली तिथि व समय।`, h1: `${n.hi} — व्रत कथा और पूजा विधि` }
    : { title: `${n.en} — Vrat Katha, Puja Vidhi & Next Date | BornClock`, description: `${n.en}: the vrat katha in plain words with sources, puja samagri and simple steps, regional customs, and the next date and timings from our Panchang.`, h1: `${n.en} — vrat katha & puja vidhi` };
}

/**
 * Which vrat page a festival-calendar entry belongs to (src/lib/vedic/festivals.ts names).
 * Pure: takes only the name and type, so the festival page and the Panchang data use it.
 */
export function vratSlugForFestival(f: { name: string; type: string }): VratSlug | null {
  if (f.type === 'ekadashi') return 'ekadashi';
  if (f.type === 'purnima') return 'satyanarayan-katha';
  if (f.name.startsWith('Pradosh Vrat')) return 'pradosh-vrat';
  if (f.name.startsWith('Sankashti Chaturthi')) return 'sankashti-chaturthi';
  if (f.name === 'Karwa Chauth') return 'karwa-chauth';
  if (f.name === 'Navratri begins (Ghatasthapana)' || f.name === 'Durga Ashtami') return 'navratri';
  if (f.name === 'Maha Shivratri') return 'mahashivratri';
  if (f.name === 'Krishna Janmashtami') return 'janmashtami';
  return null;
}

/** Weekday vrats: 1 = Monday → Somvar, 2 = Tuesday → Mangalvar (0 = Sunday). */
export function vratSlugForWeekday(dow: number): VratSlug | null {
  return dow === 1 ? 'somvar-vrat' : dow === 2 ? 'mangalvar-vrat' : null;
}
