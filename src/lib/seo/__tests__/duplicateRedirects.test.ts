import { describe, it, expect } from 'vitest';
import { duplicateRedirect } from '../duplicateRedirects';
import { bornOnIndiaPath, INDIA_BORNON_SLUGS } from '../indiaBornOnSlugs';
import indiaDates from '../../../data/indiaBornOnDates.json';

// Batch 6 (SEO) — retired duplicate URL → kept URL. Expected values are the kept
// routes as they exist in scripts/prerender-routes.mjs (the sitemap source).
const INDIA = new Set((indiaDates as { slug: string }[]).map(d => d.slug));
const NO_INDIA = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  .flatMap((m, i) => Array.from({ length: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i] }, (_, d) => `${m}-${d + 1}`))
  .filter(s => !INDIA.has(s));

describe('duplicateRedirect — /born-on/:month/:day/personality → /birthday/:m/:d/', () => {
  it.each([
    ['/born-on/august/6/personality', '/birthday/8/6/'],
    ['/born-on/august/6/personality/', '/birthday/8/6/'],
    ['/born-on/january/1/personality', '/birthday/1/1/'],
    ['/born-on/february/29/personality', '/birthday/2/29/'],
    ['/born-on/december/31/personality', '/birthday/12/31/'],
    ['/born-on/september/04/personality', '/birthday/9/4/'],
    ['/born-on/September/4/personality', '/birthday/9/4/'],
  ])('%s → %s', (from, to) => expect(duplicateRedirect(from)).toBe(to));

  it.each(['/born-on/february/30/personality', '/born-on/april/31/personality', '/born-on/smarch/1/personality', '/born-on/may/0/personality'])(
    'impossible date %s → null (left to the real-404 check)', p => expect(duplicateRedirect(p)).toBeNull());
});

describe('duplicateRedirect — /born-on/:month/:day → /born-on/:month-:day/', () => {
  it.each([
    ['/born-on/may/13', '/born-on/may-13/'],
    ['/born-on/may/13/', '/born-on/may-13/'],
    ['/born-on/january/1', '/born-on/january-1/'],
    ['/born-on/february/29', '/born-on/february-29/'],
    ['/born-on/december/31', '/born-on/december-31/'],
    ['/born-on/march/05', '/born-on/march-5/'],
    ['/born-on/MARCH/5', '/born-on/march-5/'],
  ])('%s → %s', (from, to) => expect(duplicateRedirect(from)).toBe(to));

  it.each(['/born-on/february/30', '/born-on/june/31', '/born-on/foo/3', '/born-on/may/123'])(
    'invalid %s → null', p => expect(duplicateRedirect(p)).toBeNull());
});

describe('duplicateRedirect — /birthday/:month-:day (old celebrity list) → /born-on/:month-:day/', () => {
  it.each([
    ['/birthday/june-13', '/born-on/june-13/'],
    ['/birthday/june-13/', '/born-on/june-13/'],
    ['/birthday/february-29', '/born-on/february-29/'],
    ['/birthday/december-31', '/born-on/december-31/'],
    ['/birthday/january-01', '/born-on/january-1/'],
  ])('%s → %s', (from, to) => expect(duplicateRedirect(from)).toBe(to));
  it('invalid /birthday/february-30 → null', () => expect(duplicateRedirect('/birthday/february-30')).toBeNull());
});

describe('duplicateRedirect — static retired pages', () => {
  it.each([
    ['/biological-age-calculator', '/biological-age/'],
    ['/biological-age-calculator/', '/biological-age/'],
    ['/articles/biological-age-vs-chronological-age', '/biological-age-vs-chronological-age/'],
    ['/articles/biological-age-vs-chronological-age/', '/biological-age-vs-chronological-age/'],
    ['/life-expectancy-calculator-usa', '/life-expectancy-usa/'],
    ['/life-expectancy-calculator-uk/', '/life-expectancy-uk/'],
    ['/life-expectancy-calculator-australia', '/life-expectancy-australia/'],
    ['/life-expectancy-calculator-canada', '/life-expectancy-canada/'],
    // Batch 9: thin Hindi Life Path page → the Hindi Mulank/Bhagyank calculator.
    ['/numerology-hindi', '/hi/numerology-by-date-of-birth/'],
    ['/numerology-hindi/', '/hi/numerology-by-date-of-birth/'],
    // Batch 11: the "who shares my birthday" article → the finder that answers it.
    ['/answers/who-shares-my-birthday', '/celebrity-birthday/'],
    ['/answers/who-shares-my-birthday/', '/celebrity-birthday/'],
  ])('%s → %s', (from, to) => expect(duplicateRedirect(from)).toBe(to));
});

describe('duplicateRedirect — kept URLs are left alone (no redirect loops)', () => {
  it.each([
    '/birthday/8/6', '/birthday/8/6/', '/birthday/2/29/', '/birthday/12/31/', '/birthday/1/1',
    '/birthday/8', '/birthday',
    '/born-on/august-6', '/born-on/august-6/', '/born-on/february-29/', '/born-on/december-31/',
    '/born-on/august-6/india/', '/born-on', '/born-on/india', '/born-on/india/',
    '/biological-age', '/biological-age/', '/biological-age-vs-chronological-age/', '/biological-age-hindi/',
    '/answers/what-is-my-biological-age/',
    '/life-expectancy-usa/', '/life-expectancy-calculator-singapore-uae/',
    '/chinese-zodiac/rat/', '/chinese-horoscope/rat/', '/on-this-day/may/13/',
    '/', '/zodiac/aries/',
  ])('%s → null', p => expect(duplicateRedirect(p)).toBeNull());
});

describe('duplicateRedirect — zero-padding / case normalisation of kept date URLs', () => {
  it.each([
    ['/birthday/09/04', '/birthday/9/4/'],
    ['/birthday/02/29/', '/birthday/2/29/'],
    ['/birthday/12/01', '/birthday/12/1/'],
    ['/born-on/september-04', '/born-on/september-4/'],
    ['/born-on/December-31', '/born-on/december-31/'],
  ])('%s → %s', (from, to) => expect(duplicateRedirect(from)).toBe(to));
  it('/born-on/august-06/india → /born-on/august-6/india/ (with and without the India index)', () => {
    expect(duplicateRedirect('/born-on/august-06/india')).toBe('/born-on/august-6/india/');
    expect(duplicateRedirect('/born-on/august-06/india', { indiaSlugs: INDIA_BORNON_SLUGS })).toBe('/born-on/august-6/india/');
  });
  it.each(['/birthday/13/1', '/birthday/2/30', '/birthday/00/10'])('invalid %s → null', p => expect(duplicateRedirect(p)).toBeNull());
});

describe('duplicateRedirect — India URL for a date with no India page', () => {
  it('the data has dates without an India page (so this rule is exercised)', () => {
    expect(NO_INDIA.length).toBeGreaterThan(0);
  });
  it('server (with the India index): every such /born-on/:slug/india → /born-on/:slug/', () => {
    for (const slug of NO_INDIA) expect(duplicateRedirect(`/born-on/${slug}/india`, { indiaSlugs: INDIA_BORNON_SLUGS })).toBe(`/born-on/${slug}/`);
  });
  it('server: every real India page is kept', () => {
    for (const slug of INDIA) expect(duplicateRedirect(`/born-on/${slug}/india/`, { indiaSlugs: INDIA_BORNON_SLUGS })).toBeNull();
  });
  it('client (no India index): India URLs are left to BornOnDayIndia', () => {
    expect(duplicateRedirect(`/born-on/${NO_INDIA[0]}/india/`)).toBeNull();
  });
  it('bornOnIndiaPath links straight to the kept URL', () => {
    const [withIndia] = [...INDIA];
    expect(bornOnIndiaPath(withIndia)).toBe(`/born-on/${withIndia}/india/`);
    expect(bornOnIndiaPath(NO_INDIA[0])).toBe(`/born-on/${NO_INDIA[0]}/`);
  });
});

describe('duplicateRedirect — every retired date URL (all 366 days) maps to the same date', () => {
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  it('366 global + 366 personality + 366 /birthday/:month-:day', () => {
    let n = 0;
    MONTHS.forEach((m, i) => {
      for (let d = 1; d <= DAYS[i]; d++) {
        expect(duplicateRedirect(`/born-on/${m}/${d}`)).toBe(`/born-on/${m}-${d}/`);
        expect(duplicateRedirect(`/born-on/${m}/${d}/personality`)).toBe(`/birthday/${i + 1}/${d}/`);
        expect(duplicateRedirect(`/birthday/${m}-${d}`)).toBe(`/born-on/${m}-${d}/`);
        n++;
      }
    });
    expect(n).toBe(366);
  });
});
