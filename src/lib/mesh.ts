// src/lib/mesh.ts — data-driven internal linking mesh (SEO-MAGNET-2 Phase B).
// Pure functions that derive crawlable, contextually-relevant links from the
// existing content data (blog tags, zodiac month spans). Used by BornOnDay,
// MonthHub, ZodiacSign, FitnessRhythmPage and BlogPost to weave every page into
// the topical graph. No side effects, no network — safe in the prerender path.
import { blogPosts, type BlogPost } from '@/data/blogPosts';

const MONTH_SLUGS = [
  '', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/** Blog posts whose tags/keywords/category best match the given tags. */
export function postsForTags(tags: string[], limit = 2, excludeSlug?: string): BlogPost[] {
  const want = tags.map(t => t.toLowerCase().trim()).filter(Boolean);
  if (want.length === 0) return [];
  const scored = blogPosts
    .filter(p => p.slug !== excludeSlug)
    .map(p => {
      const hay = [...(p.tags || []), ...(p.keywords || []), p.category, p.title]
        .map(x => String(x).toLowerCase());
      let score = 0;
      for (const w of want) {
        for (const h of hay) {
          if (h === w) score += 3;
          else if (h.includes(w) || w.includes(h)) score += 1;
        }
      }
      return { p, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(x => x.p);
}

// Tool catalog for the "Tools mentioned" block on blog posts. Each tool matches
// when any of its keywords appears (as a substring) in the post's tags/keywords.
type Tool = { label: string; to: string; match: string[] };
const TOOLS: Tool[] = [
  { label: 'Age Calculator', to: '/age-calculator', match: ['age calculator', 'exact age', 'how old', 'age in', 'calculate age'] },
  { label: 'Life Expectancy Calculator', to: '/life-expectancy', match: ['life expectancy', 'longevity', 'live longer', 'lifespan', 'centenarian', 'blue zones', 'quit smoking', 'sleep', 'stress', 'bmi', 'diet', 'exercise'] },
  { label: 'Zodiac Signs', to: '/zodiac', match: ['zodiac', 'astrology', 'star sign', 'sun sign', 'horoscope'] },
  { label: 'Birthstone Finder', to: '/birthstone', match: ['birthstone', 'gemstone'] },
  { label: 'Numerology', to: '/numerology', match: ['numerology', 'life path'] },
  { label: 'Biorhythm & Energy', to: '/biorhythm', match: ['biorhythm', 'rhythm', 'cycle syncing', 'energy forecast', 'circadian'] },
  { label: 'Celebrity Birthdays', to: '/celebrity-birthday', match: ['celebrity', 'famous birthdays', 'birthday twins', 'shares my birthday'] },
  { label: 'Chinese Zodiac', to: '/chinese-zodiac', match: ['chinese zodiac'] },
  { label: 'Birthday Report', to: '/birthday-report', match: ['birthday', 'birthday report', 'gift'] },
];

/** Tools relevant to a blog post, derived from its tags/keywords. */
export function toolsForTags(tags: string[], keywords: string[] = [], limit = 4): Tool[] {
  const hay = [...tags, ...keywords].map(t => t.toLowerCase());
  const hit = (tool: Tool) => tool.match.some(m => hay.some(h => h.includes(m)));
  const matched = TOOLS.filter(hit);
  // Always guarantee a money-page path even for off-topic posts.
  if (!matched.some(t => t.to === '/birthday-report')) {
    matched.push(TOOLS.find(t => t.to === '/birthday-report')!);
  }
  return matched.slice(0, limit);
}

/** Month-hub slugs a zodiac sign's date range spans (1–2 months). */
export function monthsForZodiac(startMonth: number, endMonth: number): { slug: string; label: string }[] {
  const months = startMonth === endMonth ? [startMonth] : [startMonth, endMonth];
  return months.map(m => ({ slug: MONTH_SLUGS[m], label: MONTH_SLUGS[m].charAt(0).toUpperCase() + MONTH_SLUGS[m].slice(1) }));
}
