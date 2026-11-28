/** B24 — duplicate blog posts and tool-mirroring answers 301 to the one page per intent. */
import { describe, it, expect } from 'vitest';
import { duplicateRedirect } from '../duplicateRedirects';
import { blogPosts } from '@/data/blogPosts';
import { injectDailyHtml } from '@/lib/daily/inject';
import { computeDaily } from '@/lib/daily/compute';

describe('B24 merges', () => {
  it('M1 — retired URLs 301 to live pages, and the retired posts are gone from the blog', () => {
    const map: Record<string, string> = {
      '/blog/sleep-longevity-science': '/blog/how-sleep-affects-life-expectancy-complete-guide/',
      '/blog/zodiac-signs-complete-personality-guide-all-12': '/blog/zodiac-signs-complete-guide-personality-traits-compatibility/',
      '/answers/how-long-will-i-live': '/how-long-will-i-live/',
      '/answers/what-generation-am-i': '/generation/',
      '/answers/how-old-am-i-on-mars': '/planetary-age/',
    };
    const slugs = new Set(blogPosts.map(p => p.slug));
    for (const [from, to] of Object.entries(map)) {
      expect(duplicateRedirect(from, { indiaSlugs: new Set() }), from).toBe(to);
      const m = to.match(/^\/blog\/(.+)\/$/);
      if (m) expect(slugs.has(m[1]), to).toBe(true);
    }
    for (const s of ['sleep-longevity-science', 'exercise-longevity-guide', 'longevity-diet-guide', 'stress-mental-health-longevity', 'zodiac-signs-complete-personality-guide-all-12']) expect(slugs.has(s)).toBe(false);
  });
  it('M2 — the today pages carry the day\'s "born on" share card', () => {
    const e = computeDaily('birthdays-today-india', '2026-11-28', 'index');
    expect(e.ogImage).toBe('https://bornclock.com/og/born-on/november-28.webp');
    const shell = '<head><title>x</title><meta property="og:image" content="https://bornclock.com/og/default.webp"><meta name="twitter:image" content="a"></head><div data-daily="body"></div>';
    const { html } = injectDailyHtml(shell, { kind: 'birthdays-today-india', slug: 'index', path: '/todays-birthdays/india', entry: e });
    expect(html).toContain('og:image" content="https://bornclock.com/og/born-on/november-28.webp"');
    expect(html).toContain('twitter:image" content="https://bornclock.com/og/born-on/november-28.webp"');
  });
});
