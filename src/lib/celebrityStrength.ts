/**
 * B25 — which celebrity profiles we ask Google to index. Search Console data shows the whole site
 * fell from ~2,500 to ~5 daily impressions on 22 Aug 2026, the day Google's August 2026 spam update
 * finished; thousands of near-identical generated profiles are the textbook "scaled content" pattern.
 * A profile is indexed when it has something beyond the shared template: a curated (static) record,
 * a written bio, or real global recognition (30+ Wikipedia language editions). The rest stay live
 * for visitors and internal links, with `noindex, follow`, and are left out of the sitemap.
 * Used by CelebrityPage (robots meta) and scripts/gen-celebrity-slugs.mts (sitemap list).
 */
import bios from '@/data/celebrity-bios.json';

export const INDEX_MIN_SITELINKS = 30;

export function isIndexableProfile(c: Record<string, unknown>): boolean {
  const slug = String(c.slug ?? '');
  return c.source === 'static' || !!(bios as Record<string, unknown>)[slug] || Number(c.sitelinks ?? 0) >= INDEX_MIN_SITELINKS;
}
